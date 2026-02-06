-- Vangraph Database Schema
-- Core Entities + Agentic Layer

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Workspaces (Organizations)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL, -- e.g., "VAN" for Vangraph
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, key)
);

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
  
  -- Core fields
  sequence_id INTEGER, -- Auto-increment per project (VAN-001)
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status & Priority
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'none')),
  
  -- Assignment
  assignee_id UUID REFERENCES auth.users(id),
  reporter_id UUID REFERENCES auth.users(id),
  
  -- Estimation
  estimate_points INTEGER,
  
  -- Dates
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Soft delete
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
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'comment' CHECK (type IN ('comment', 'system', 'ai_reasoning')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (Human action audit)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', etc.
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Views (Saved filters)
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  display_type TEXT DEFAULT 'list' CHECK (display_type IN ('list', 'board', 'calendar', 'gantt')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENTIC LAYER
-- ============================================

-- Specs (Source of truth contracts)
CREATE TABLE IF NOT EXISTS specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  
  -- Content
  markdown_content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  
  -- Approval workflow
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Agent info
  architect_id TEXT, -- AI model identifier
  generation_prompt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reasoning Logs (Agent thought audit trail)
CREATE TABLE IF NOT EXISTS reasoning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  thread_id TEXT, -- Tambo thread ID
  task_id TEXT,
  
  -- Trace data
  thought_chain JSONB NOT NULL, -- Array of reasoning steps
  trace_id TEXT,
  
  -- Model info
  model_id TEXT NOT NULL,
  token_usage INTEGER,
  cost_usd DECIMAL(10, 6),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- MCP Servers (External tool registry)
CREATE TABLE IF NOT EXISTS mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Connection
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  auth_metadata JSONB DEFAULT '{}', -- Encrypted references
  
  -- Capabilities
  enabled_tools TEXT[] DEFAULT '{}',
  
  -- Health
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'down', 'unknown')),
  last_health_check TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context Snapshots (ACON compression history)
CREATE TABLE IF NOT EXISTS context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  thread_id TEXT,
  
  -- Compression data
  compressed_summary TEXT NOT NULL,
  pre_compression_tokens INTEGER,
  post_compression_tokens INTEGER,
  tokens_saved INTEGER GENERATED ALWAYS AS (pre_compression_tokens - post_compression_tokens) STORED,
  
  -- Hashes for verification
  pre_hash TEXT,
  post_hash TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Governance Gates (Human-in-the-loop checkpoints)
CREATE TABLE IF NOT EXISTS governance_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity reference
  entity_type TEXT NOT NULL CHECK (entity_type IN ('spec', 'issue', 'pr', 'deployment')),
  entity_id UUID NOT NULL,
  
  -- Approval
  step_type TEXT NOT NULL, -- 'spec_approval', 'code_review', 'deploy_approval'
  required_role TEXT DEFAULT 'member',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'bypassed')),
  approver_id UUID REFERENCES auth.users(id),
  
  -- Feedback
  rejection_reason TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_specs_issue ON specs(issue_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_issue ON reasoning_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_governance_entity ON governance_gates(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE specs ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on auth requirements

-- ============================================
-- FUNCTIONS
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

CREATE TRIGGER update_workspaces_timestamp BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_issues_timestamp BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_specs_timestamp BEFORE UPDATE ON specs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
