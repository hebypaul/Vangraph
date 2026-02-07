'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { completeOnboarding } from './profile';

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

export type WorkspaceActionResult = {
  error?: string;
  success?: boolean;
  workspaceId?: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  job_title: string | null;
  joined_at: string;
};

/**
 * Create a new workspace and add user as owner
 */
export async function createWorkspace(formData: FormData): Promise<WorkspaceActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const rawData = {
    name: formData.get('name') as string,
    slug: (formData.get('slug') as string)?.toLowerCase().replace(/\s+/g, '-'),
  };

  const parsed = createWorkspaceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Create workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_id: user.id,
    })
    .select()
    .single();

  if (workspaceError) {
    if (workspaceError.code === '23505') {
      return { error: 'A workspace with this slug already exists' };
    }
    return { error: workspaceError.message };
  }

  // Add user as owner in workspace_members
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    console.error('Error adding workspace member:', memberError);
    // Clean up workspace if member add fails
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    return { error: 'Failed to set up workspace membership' };
  }

  // Mark onboarding as complete
  await completeOnboarding();

  revalidatePath('/', 'layout');
  redirect('/board');
}

/**
 * Get workspaces for current user
 */
export async function getUserWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspaces(*)')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }

  return data?.map((m) => m.workspaces as unknown as Workspace).filter(Boolean) ?? [];
}

/**
 * Get current user's membership in a workspace
 */
export async function getWorkspaceMembership(
  workspaceId: string
): Promise<WorkspaceMember | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching membership:', error);
    return null;
  }

  return data;
}

/**
 * Update a member's role (admin/owner only)
 */
export async function updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: 'admin' | 'manager' | 'member' | 'viewer'
): Promise<WorkspaceActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if current user is admin/owner
  const membership = await getWorkspaceMembership(workspaceId);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'You do not have permission to change roles' };
  }

  // Cannot change owner role
  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)
    .single();

  if (targetMember?.role === 'owner') {
    return { error: 'Cannot change the owner role' };
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

/**
 * Invite a user to workspace (creates pending invitation)
 */
export async function inviteToWorkspace(
  workspaceId: string,
  email: string,
  role: 'admin' | 'manager' | 'member' | 'viewer' = 'member'
): Promise<WorkspaceActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if current user is admin/owner
  const membership = await getWorkspaceMembership(workspaceId);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'You do not have permission to invite members' };
  }

  // Find user by email
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!targetProfile) {
    return { error: 'User not found. They must sign up first.' };
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetProfile.id)
    .single();

  if (existingMember) {
    return { error: 'User is already a member of this workspace' };
  }

  // Add to workspace
  const { error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: targetProfile.id,
      role,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}
