-- ============================================
-- VANGRAPH COMPLETE SETUP & SEED DATA
-- Run this in Supabase SQL Editor
-- This script sets up the schema AND populates with realistic data
-- ============================================

-- ============================================
-- STEP 1: CREATE SCHEMA (from vangraph_schema.sql)
-- ============================================

-- Workspaces (Organizations)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop old sprints if it doesn't have project_id and recreate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sprints' AND column_name = 'project_id'
  ) THEN
    DROP TABLE IF EXISTS sprints CASCADE;
  END IF;
END $$;

-- Sprints (Cycles)
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  velocity_target INTEGER,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (Code-aware feature groups)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_paths TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues (Work Items)
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  
  sequence_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'none')),
  
  assignee_id UUID,
  reporter_id UUID,
  
  estimate_points INTEGER,
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue Labels (Many-to-Many)
CREATE TABLE IF NOT EXISTS issue_labels (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'comment' CHECK (type IN ('comment', 'system', 'ai_reasoning')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (Human action audit)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specs (Source of truth contracts)
CREATE TABLE IF NOT EXISTS specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  markdown_content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  architect_id TEXT,
  generation_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reasoning Logs (Agent thought audit trail)
CREATE TABLE IF NOT EXISTS reasoning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  thread_id TEXT,
  task_id TEXT,
  thought_chain JSONB NOT NULL,
  trace_id TEXT,
  model_id TEXT NOT NULL,
  token_usage INTEGER,
  cost_usd DECIMAL(10, 6),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- Governance Gates (Human-in-the-loop checkpoints)
CREATE TABLE IF NOT EXISTS governance_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('spec', 'issue', 'pr', 'deployment')),
  entity_id UUID NOT NULL,
  step_type TEXT NOT NULL,
  required_role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'bypassed')),
  approver_id UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_specs_issue ON specs(issue_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_issue ON reasoning_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_governance_entity ON governance_gates(entity_type, entity_id);

-- ============================================
-- STEP 3: CREATE FUNCTIONS
-- ============================================

-- Auto-increment issue sequence_id per project
CREATE OR REPLACE FUNCTION set_issue_sequence_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sequence_id := COALESCE(
    (SELECT MAX(sequence_id) FROM issues WHERE project_id = NEW.project_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_issue_sequence ON issues;
CREATE TRIGGER trigger_issue_sequence
  BEFORE INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION set_issue_sequence_id();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workspaces_timestamp ON workspaces;
DROP TRIGGER IF EXISTS update_projects_timestamp ON projects;
DROP TRIGGER IF EXISTS update_issues_timestamp ON issues;
DROP TRIGGER IF EXISTS update_specs_timestamp ON specs;

CREATE TRIGGER update_workspaces_timestamp BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_issues_timestamp BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_specs_timestamp BEFORE UPDATE ON specs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 4: ENABLE RLS WITH ANON POLICIES
-- ============================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_gates ENABLE ROW LEVEL SECURITY;

-- Create anon access policies for development
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow anon all" ON workspaces;
  CREATE POLICY "Allow anon all" ON workspaces FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON projects;
  CREATE POLICY "Allow anon all" ON projects FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON sprints;
  CREATE POLICY "Allow anon all" ON sprints FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON modules;
  CREATE POLICY "Allow anon all" ON modules FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON labels;
  CREATE POLICY "Allow anon all" ON labels FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON issues;
  CREATE POLICY "Allow anon all" ON issues FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON issue_labels;
  CREATE POLICY "Allow anon all" ON issue_labels FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON comments;
  CREATE POLICY "Allow anon all" ON comments FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON activities;
  CREATE POLICY "Allow anon all" ON activities FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON specs;
  CREATE POLICY "Allow anon all" ON specs FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON reasoning_logs;
  CREATE POLICY "Allow anon all" ON reasoning_logs FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow anon all" ON governance_gates;
  CREATE POLICY "Allow anon all" ON governance_gates FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ============================================
-- STEP 5: SEED DATA
-- ============================================

-- Clear existing data
DELETE FROM issue_labels;
DELETE FROM comments;
DELETE FROM activities;
DELETE FROM specs;
DELETE FROM reasoning_logs;
DELETE FROM governance_gates;
DELETE FROM issues;
DELETE FROM labels;
DELETE FROM modules;
DELETE FROM sprints;
DELETE FROM projects;
DELETE FROM workspaces;

-- ============================================
-- WORKSPACE
-- ============================================
INSERT INTO workspaces (id, name, slug, settings) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Vangraph Organization', 'vangraph-org', 
   '{"theme": "dark", "timezone": "Asia/Kolkata", "ai_enabled": true}');

-- ============================================
-- PROJECT
-- ============================================
INSERT INTO projects (id, workspace_id, name, key, description, tech_stack, settings) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 
   'Vangraph Platform', 'VAN', 
   'AI-powered project management platform with autonomous agent collaboration, natural language task creation, and intelligent sprint planning.',
   ARRAY['Next.js 15', 'TypeScript', 'Supabase', 'Tambo AI', 'Tailwind CSS', 'React 19', 'PostgreSQL'],
   '{"default_sprint_length": 14, "velocity_tracking": true, "ai_agent_enabled": true}');

-- ============================================
-- SPRINTS
-- ============================================
INSERT INTO sprints (id, project_id, name, description, start_date, end_date, velocity_target, status) VALUES
  -- Active Sprint
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 
   'Sprint 1 - Foundation', 
   'Core platform setup: authentication, database schema, UI components, and basic AI integration.',
   '2026-02-03', '2026-02-16', 35, 'active'),
  -- Upcoming Sprint
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 
   'Sprint 2 - AI Agents', 
   'Implement autonomous AI agents for task management, code analysis, and intelligent recommendations.',
   '2026-02-17', '2026-03-02', 40, 'planned'),
  -- Completed Sprint (for velocity calculation)
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', 
   'Sprint 0 - Planning', 
   'Initial project planning, architecture design, and tech stack decisions.',
   '2026-01-20', '2026-02-02', 20, 'completed');

-- ============================================
-- LABELS (for categorization)
-- ============================================
INSERT INTO labels (id, project_id, name, color) VALUES
  ('44444444-4444-4444-4444-444444444001', '22222222-2222-2222-2222-222222222222', 'bug', '#ef4444'),
  ('44444444-4444-4444-4444-444444444002', '22222222-2222-2222-2222-222222222222', 'feature', '#22c55e'),
  ('44444444-4444-4444-4444-444444444003', '22222222-2222-2222-2222-222222222222', 'enhancement', '#3b82f6'),
  ('44444444-4444-4444-4444-444444444004', '22222222-2222-2222-2222-222222222222', 'documentation', '#a855f7'),
  ('44444444-4444-4444-4444-444444444005', '22222222-2222-2222-2222-222222222222', 'critical', '#dc2626'),
  ('44444444-4444-4444-4444-444444444006', '22222222-2222-2222-2222-222222222222', 'frontend', '#06b6d4'),
  ('44444444-4444-4444-4444-444444444007', '22222222-2222-2222-2222-222222222222', 'backend', '#f59e0b'),
  ('44444444-4444-4444-4444-444444444008', '22222222-2222-2222-2222-222222222222', 'ai', '#8b5cf6'),
  ('44444444-4444-4444-4444-444444444009', '22222222-2222-2222-2222-222222222222', 'security', '#f43f5e'),
  ('44444444-4444-4444-4444-444444444010', '22222222-2222-2222-2222-222222222222', 'performance', '#14b8a6');

-- ============================================
-- MODULES (code areas)
-- ============================================
INSERT INTO modules (id, project_id, name, description, file_paths, color) VALUES
  ('55555555-5555-5555-5555-555555555001', '22222222-2222-2222-2222-222222222222', 
   'Core UI', 'Main application pages, layouts, and navigation components',
   ARRAY['src/app', 'src/components/layout'], '#6366f1'),
  ('55555555-5555-5555-5555-555555555002', '22222222-2222-2222-2222-222222222222', 
   'Atomic Components', 'Reusable UI building blocks: buttons, inputs, modals, etc.',
   ARRAY['src/components/atomic'], '#ec4899'),
  ('55555555-5555-5555-5555-555555555003', '22222222-2222-2222-2222-222222222222', 
   'Supabase Integration', 'Database services, API calls, and data management',
   ARRAY['src/services/supabase', 'supabase'], '#22c55e'),
  ('55555555-5555-5555-5555-555555555004', '22222222-2222-2222-2222-222222222222', 
   'Tambo AI', 'AI agent integration, tools, and natural language processing',
   ARRAY['src/lib/tambo.ts', 'src/components/ai'], '#f59e0b'),
  ('55555555-5555-5555-5555-555555555005', '22222222-2222-2222-2222-222222222222', 
   'Types & Utilities', 'TypeScript types, constants, and helper functions',
   ARRAY['src/types', 'src/lib'], '#8b5cf6');

-- ============================================
-- ISSUES - Comprehensive set across all statuses
-- ============================================

-- BACKLOG (8 issues)
INSERT INTO issues (id, project_id, sprint_id, module_id, title, description, status, priority, estimate_points, due_date, archived) VALUES
  ('66666666-6666-6666-6666-666666666001', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555004',
   'Implement AI code review agent',
   'Create an autonomous agent that reviews pull requests, suggests improvements, and identifies potential bugs before human review. Should integrate with GitHub API.',
   'backlog', 'high', 8, NULL, false),
  
  ('66666666-6666-6666-6666-666666666002', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555001',
   'Design dark mode theme system',
   'Implement a comprehensive dark mode theme with proper CSS variables, seamless transitions, and user preference persistence.',
   'backlog', 'medium', 5, NULL, false),
  
  ('66666666-6666-6666-6666-666666666003', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555003',
   'Add realtime collaboration',
   'Implement Supabase realtime subscriptions for live updates when team members modify issues, comments, or sprint data.',
   'backlog', 'high', 8, NULL, false),
  
  ('66666666-6666-6666-6666-666666666004', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555002',
   'Create notification toast system',
   'Build a toast notification component with different severity levels (success, warning, error, info) and auto-dismiss functionality.',
   'backlog', 'low', 3, NULL, false),
  
  ('66666666-6666-6666-6666-666666666005', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555004',
   'Natural language sprint planning',
   'Allow users to describe sprint goals in plain English and have AI automatically suggest and assign tasks based on team capacity.',
   'backlog', 'high', 13, NULL, false),
  
  ('66666666-6666-6666-6666-666666666006', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555001',
   'Build team management dashboard',
   'Create a dashboard showing team member workload, availability, skills, and current task assignments with visual charts.',
   'backlog', 'medium', 8, NULL, false),
  
  ('66666666-6666-6666-6666-666666666007', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555003',
   'Implement audit logging',
   'Track all user and AI agent actions with detailed audit logs for compliance and debugging purposes.',
   'backlog', 'medium', 5, NULL, false),
  
  ('66666666-6666-6666-6666-666666666008', '22222222-2222-2222-2222-222222222222', NULL, '55555555-5555-5555-5555-555555555005',
   'Add keyboard shortcuts',
   'Implement global keyboard shortcuts for common actions: create task, navigate between views, search, etc.',
   'backlog', 'low', 3, NULL, false);

-- TODO (6 issues assigned to current sprint)
INSERT INTO issues (id, project_id, sprint_id, module_id, title, description, status, priority, estimate_points, due_date, archived) VALUES
  ('66666666-6666-6666-6666-666666666009', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Implement drag-and-drop for Kanban board',
   'Add drag-and-drop functionality to move issues between status columns. Should update database in real-time and show visual feedback during drag.',
   'todo', 'high', 5, '2026-02-12', false),
  
  ('66666666-6666-6666-6666-666666666010', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555004',
   'Connect createTask Tambo tool to Supabase',
   'Wire the AI createTask tool to actually persist tasks to the database. Include proper error handling and user feedback.',
   'todo', 'urgent', 3, '2026-02-10', false),
  
  ('66666666-6666-6666-6666-666666666011', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555002',
   'Create issue detail modal',
   'Build a comprehensive modal for viewing and editing issue details including title, description, status, priority, assignee, labels, and comments.',
   'todo', 'high', 5, '2026-02-13', false),
  
  ('66666666-6666-6666-6666-666666666012', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555003',
   'Add sprint burndown chart',
   'Implement an interactive burndown chart showing sprint progress with ideal vs actual velocity lines.',
   'todo', 'medium', 5, '2026-02-14', false),
  
  ('66666666-6666-6666-6666-666666666013', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555005',
   'Setup end-to-end testing',
   'Configure Playwright for E2E testing and write initial tests for critical user flows: login, create task, update status.',
   'todo', 'medium', 5, NULL, false),
  
  ('66666666-6666-6666-6666-666666666014', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Build project settings page',
   'Create a settings page for project configuration including name, description, tech stack, sprint settings, and integrations.',
   'todo', 'low', 3, '2026-02-15', false);

-- IN PROGRESS (5 issues)
INSERT INTO issues (id, project_id, sprint_id, module_id, title, description, status, priority, estimate_points, due_date, started_at, archived) VALUES
  ('66666666-6666-6666-6666-666666666015', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555003',
   'Complete Supabase integration',
   'Remove all mock data and fully connect frontend to real Supabase backend. Update all services to query database directly.',
   'in_progress', 'urgent', 8, '2026-02-08', NOW() - INTERVAL '2 days', false),
  
  ('66666666-6666-6666-6666-666666666016', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Build analytics dashboard',
   'Create an analytics page with project velocity charts, team productivity metrics, and AI cost tracking visualizations.',
   'in_progress', 'high', 8, '2026-02-11', NOW() - INTERVAL '1 day', false),
  
  ('66666666-6666-6666-6666-666666666017', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555004',
   'Implement AI chat interface',
   'Build a chat UI for natural language interaction with AI agents. Support streaming responses and suggested prompts.',
   'in_progress', 'high', 5, '2026-02-09', NOW() - INTERVAL '3 days', false),
  
  ('66666666-6666-6666-6666-666666666018', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555002',
   'Create filter and search components',
   'Build reusable filter dropdowns and a global search component with keyboard navigation and recent searches.',
   'in_progress', 'medium', 3, '2026-02-10', NOW() - INTERVAL '1 day', false),
  
  ('66666666-6666-6666-6666-666666666019', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555005',
   'Add TypeScript strict mode',
   'Enable strict TypeScript checks and fix all type errors across the codebase for improved code quality.',
   'in_progress', 'medium', 3, '2026-02-08', NOW() - INTERVAL '4 hours', false);

-- IN REVIEW (3 issues)
INSERT INTO issues (id, project_id, sprint_id, module_id, title, description, status, priority, estimate_points, due_date, started_at, archived) VALUES
  ('66666666-6666-6666-6666-666666666020', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Redesign navigation sidebar',
   'Modernize the sidebar with collapsible sections, workspace switcher, quick actions, and improved visual hierarchy.',
   'in_review', 'high', 5, '2026-02-07', NOW() - INTERVAL '5 days', false),
  
  ('66666666-6666-6666-6666-666666666021', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555002',
   'Implement responsive breakpoints',
   'Add proper responsive design for tablet and mobile views. Test all major components across screen sizes.',
   'in_review', 'medium', 3, '2026-02-08', NOW() - INTERVAL '3 days', false),
  
  ('66666666-6666-6666-6666-666666666022', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555003',
   'Add error boundary components',
   'Implement React error boundaries to gracefully handle and display errors without crashing the entire app.',
   'in_review', 'medium', 2, '2026-02-07', NOW() - INTERVAL '2 days', false);

-- DONE (8 issues from current sprint)
INSERT INTO issues (id, project_id, sprint_id, module_id, title, description, status, priority, estimate_points, due_date, started_at, completed_at, archived) VALUES
  ('66666666-6666-6666-6666-666666666023', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Setup Next.js 15 project',
   'Initialize the project with Next.js 15, TypeScript, Tailwind CSS, and configure proper folder structure.',
   'done', 'urgent', 3, '2026-02-04', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', false),
  
  ('66666666-6666-6666-6666-666666666024', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555003',
   'Configure Supabase client',
   'Setup Supabase client singleton with environment variables and TypeScript types for the database schema.',
   'done', 'urgent', 2, '2026-02-04', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', false),
  
  ('66666666-6666-6666-6666-666666666025', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555002',
   'Build atomic component library',
   'Create foundational UI components: Button, Input, Modal, Dropdown, Badge, Avatar, Skeleton, Card.',
   'done', 'high', 8, '2026-02-06', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', false),
  
  ('66666666-6666-6666-6666-666666666026', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Create main layout with sidebar',
   'Implement the main app layout with a collapsible sidebar, header, and content area.',
   'done', 'high', 5, '2026-02-05', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', false),
  
  ('66666666-6666-6666-6666-666666666027', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Build home dashboard page',
   'Create the main dashboard with sprint overview, recent activity, quick stats, and AI chat widget.',
   'done', 'high', 5, '2026-02-06', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', false),
  
  ('66666666-6666-6666-6666-666666666028', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555001',
   'Build Kanban board page',
   'Implement the Kanban board view with status columns, issue cards, and filtering capabilities.',
   'done', 'high', 5, '2026-02-07', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', false),
  
  ('66666666-6666-6666-6666-666666666029', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555004',
   'Integrate Tambo AI SDK',
   'Setup Tambo provider, configure API keys, and create initial AI tools for task management.',
   'done', 'urgent', 5, '2026-02-05', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', false),
  
  ('66666666-6666-6666-6666-666666666030', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555005',
   'Define TypeScript types',
   'Create comprehensive TypeScript interfaces for all entities: Issue, Sprint, Project, User, etc.',
   'done', 'high', 3, '2026-02-04', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', false);

-- ============================================
-- ADD SOME COMMENTS
-- ============================================
INSERT INTO comments (id, issue_id, content, type, created_at) VALUES
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666015', 
   'Started working on removing mock data from services. The client.ts and issues.ts are done, moving to projects next.', 
   'comment', NOW() - INTERVAL '1 day'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666015', 
   'AI Agent: Analyzing the codebase structure. Found 7 service files that need mock data removal. Estimated completion: 2 hours.', 
   'ai_reasoning', NOW() - INTERVAL '6 hours'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666020', 
   'The new sidebar design looks great! Just a few minor spacing adjustments needed on the collapsed state.', 
   'comment', NOW() - INTERVAL '12 hours'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666017', 
   'Added streaming response support. Need to add suggested prompts feature next.', 
   'comment', NOW() - INTERVAL '2 days');

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Tables populated successfully!' as message;
SELECT 'Workspaces:' as table_name, count(*) as count FROM workspaces
UNION ALL SELECT 'Projects:', count(*) FROM projects
UNION ALL SELECT 'Sprints:', count(*) FROM sprints
UNION ALL SELECT 'Labels:', count(*) FROM labels
UNION ALL SELECT 'Modules:', count(*) FROM modules
UNION ALL SELECT 'Issues:', count(*) FROM issues
UNION ALL SELECT 'Comments:', count(*) FROM comments
ORDER BY table_name;

-- Show issue distribution by status
SELECT 'Issue distribution by status:' as info;
SELECT status, count(*) as count FROM issues GROUP BY status ORDER BY 
  CASE status 
    WHEN 'backlog' THEN 1 
    WHEN 'todo' THEN 2 
    WHEN 'in_progress' THEN 3 
    WHEN 'in_review' THEN 4 
    WHEN 'done' THEN 5 
    WHEN 'cancelled' THEN 6 
  END;
