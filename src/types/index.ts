// Vangraph Type Definitions
// Core entities + Agentic layer

// ============================================
// ENUMS
// ============================================

export type IssueStatus = 
  | 'backlog' 
  | 'todo' 
  | 'in_progress' 
  | 'in_review' 
  | 'done' 
  | 'cancelled';

export type Priority = 
  | 'urgent' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'none';

export type SprintStatus = 
  | 'planned' 
  | 'active' 
  | 'completed';

export type GateStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'bypassed';

export type McpHealthStatus = 
  | 'healthy' 
  | 'degraded' 
  | 'down' 
  | 'unknown';

export type CommentType = 
  | 'comment' 
  | 'system' 
  | 'ai_reasoning';

export type ViewDisplayType = 
  | 'list' 
  | 'board' 
  | 'calendar' 
  | 'gantt';

export type EntityType = 
  | 'spec' 
  | 'issue' 
  | 'pr' 
  | 'deployment';

// ============================================
// CORE ENTITIES
// ============================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description?: string;
  tech_stack: string[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  velocity_target?: number;
  status: SprintStatus;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_paths: string[];
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Issue {
  id: string;
  project_id: string;
  sprint_id?: string;
  module_id?: string;
  parent_id?: string;
  
  // Core
  sequence_id: number;
  title: string;
  description?: string;
  
  // Status
  status: IssueStatus;
  priority: Priority;
  
  // Assignment
  assignee_id?: string;
  reporter_id?: string;
  
  // Estimation
  estimate_points?: number;
  
  // Dates
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  
  // State
  archived: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relations (populated)
  labels?: Label[];
  assignee?: User;
  sprint?: Sprint;
  module?: Module;
  spec?: Spec;
  children?: Issue[];
}

export interface IssueWithKey extends Issue {
  key: string; // e.g., "VAN-001"
}

export interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  type: CommentType;
  created_at: string;
  updated_at: string;
  
  // Relations
  author?: User;
}

export interface Activity {
  id: string;
  issue_id: string;
  user_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  created_at: string;
  
  // Relations
  user?: User;
}

export interface View {
  id: string;
  project_id: string;
  created_by: string;
  name: string;
  filters: ViewFilters;
  display_type: ViewDisplayType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViewFilters {
  status?: IssueStatus[];
  priority?: Priority[];
  assignee_ids?: string[];
  label_ids?: string[];
  sprint_id?: string;
  module_id?: string;
  search?: string;
}

// ============================================
// USER
// ============================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'member' | 'viewer';
}

// ============================================
// AGENTIC LAYER
// ============================================

export interface Spec {
  id: string;
  issue_id: string;
  
  // Content
  markdown_content: string;
  version: number;
  
  // Approval
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  
  // Agent
  architect_id?: string;
  generation_prompt?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SpecVersion {
  version: number;
  markdown_content: string;
  created_at: string;
  is_approved: boolean;
}

export interface ReasoningLog {
  id: string;
  issue_id?: string;
  thread_id?: string;
  task_id?: string;
  
  // Trace
  thought_chain: ThoughtStep[];
  trace_id?: string;
  
  // Model
  model_id: string;
  token_usage?: number;
  cost_usd?: number;
  
  // Timing
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface ThoughtStep {
  step: number;
  type: 'observation' | 'reasoning' | 'plan' | 'action' | 'reflection';
  content: string;
  tool_calls?: ToolCall[];
  timestamp: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  success: boolean;
}

export interface McpServer {
  id: string;
  workspace_id: string;
  
  // Connection
  name: string;
  endpoint_url: string;
  auth_metadata: Record<string, unknown>;
  
  // Capabilities
  enabled_tools: string[];
  
  // Health
  health_status: McpHealthStatus;
  last_health_check?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ContextSnapshot {
  id: string;
  project_id: string;
  thread_id?: string;
  
  // Compression
  compressed_summary: string;
  pre_compression_tokens: number;
  post_compression_tokens: number;
  tokens_saved: number;
  
  // Verification
  pre_hash?: string;
  post_hash?: string;
  
  created_at: string;
}

export interface GovernanceGate {
  id: string;
  
  // Entity
  entity_type: EntityType;
  entity_id: string;
  
  // Approval
  step_type: string;
  required_role: string;
  status: GateStatus;
  approver_id?: string;
  
  // Feedback
  rejection_reason?: string;
  
  created_at: string;
  completed_at?: string;
}

// ============================================
// API PAYLOADS
// ============================================

export interface CreateIssuePayload {
  project_id: string;
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: Priority;
  assignee_id?: string;
  sprint_id?: string;
  module_id?: string;
  parent_id?: string;
  estimate_points?: number;
  due_date?: string;
  label_ids?: string[];
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: Priority;
  assignee_id?: string | null;
  sprint_id?: string | null;
  module_id?: string | null;
  estimate_points?: number | null;
  due_date?: string | null;
  label_ids?: string[];
}

export interface CreateSpecPayload {
  issue_id: string;
  markdown_content: string;
  architect_id?: string;
  generation_prompt?: string;
}

export interface ApproveSpecPayload {
  approved_by: string;
}

// ============================================
// ANALYTICS
// ============================================

export interface ProjectStats {
  total_issues: number;
  completed_issues: number;
  in_progress_issues: number;
  blocked_issues: number;
  completion_rate: number;
  velocity: number;
  active_sprint?: Sprint;
}

export interface SprintProgress {
  sprint: Sprint;
  total_points: number;
  completed_points: number;
  remaining_points: number;
  burndown: BurndownPoint[];
  ideal_burndown: BurndownPoint[];
}

export interface BurndownPoint {
  date: string;
  remaining: number;
}

export interface TeamWorkload {
  user_id: string;
  user: User;
  assigned_count: number;
  completed_count: number;
  in_progress_count: number;
  total_points: number;
}
