-- ============================================
-- Authentication System Migration
-- Creates: profiles, workspaces, workspace_members
-- ============================================

-- 1. Create workspaces table first (referenced by workspace_members)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create workspace_members table (contextual RBAC)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    job_title TEXT,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 5. Add foreign key from workspaces.owner_id to profiles
ALTER TABLE public.workspaces
    ADD CONSTRAINT fk_workspace_owner
    FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "profiles_select_all" ON profiles 
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Workspaces: Users can view workspaces they belong to
CREATE POLICY "workspaces_select_member" ON workspaces 
    FOR SELECT USING (
        id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
        OR owner_id = auth.uid()
    );

CREATE POLICY "workspaces_insert_authenticated" ON workspaces 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "workspaces_update_owner" ON workspaces 
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_owner" ON workspaces 
    FOR DELETE USING (owner_id = auth.uid());

-- Workspace Members: Users can view members of their workspaces
CREATE POLICY "wm_select_same_workspace" ON workspace_members 
    FOR SELECT USING (
        user_id = auth.uid() 
        OR workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "wm_insert_admin" ON workspace_members 
    FOR INSERT WITH CHECK (
        -- Allow if user is owner/admin of the workspace
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = workspace_members.workspace_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
        -- OR if user is creating their own membership (for workspace creation)
        OR user_id = auth.uid()
    );

CREATE POLICY "wm_update_admin" ON workspace_members 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id 
            AND wm.user_id = auth.uid() 
            AND wm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "wm_delete_admin" ON workspace_members 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id 
            AND wm.user_id = auth.uid() 
            AND wm.role IN ('owner', 'admin')
        )
        OR user_id = auth.uid() -- Users can leave workspaces
    );

-- ============================================
-- Auto-Create Profile Trigger
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, onboarding_complete)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        false
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation (ghost profile protection)
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
