// Tambo Context Helpers - 11 helpers providing contextual information
import { getProjectById, getProjectStats } from "@/services/supabase/projects";
import { getActiveSprint } from "@/services/supabase/sprints";

// 1. Current Time Helper
export const currentTimeHelper = () => ({
  time: new Date().toISOString(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  formatted: new Date().toLocaleString(),
});

// 2. Active Workspace Helper
export const activeWorkspaceHelper = () => ({
  // Mock - would come from auth/session context
  id: "ws-1",
  name: "Vangraph Team",
  slug: "vangraph",
  role: "admin",
});

// 3. Active Project Helper
export const activeProjectHelper = async () => {
  // Mock project - would come from route context
  const projectId = "proj-1";
  const project = await getProjectById(projectId);
  const stats = await getProjectStats(projectId);
  const sprint = await getActiveSprint(projectId);
  
  return {
    id: project?.id || projectId,
    name: project?.name || "Vangraph",
    key: project?.key || "VAN",
    tech_stack: project?.tech_stack || ["Next.js", "TypeScript", "Supabase"],
    active_sprint: sprint ? {
      name: sprint.name,
      end_date: sprint.end_date,
    } : null,
    stats: {
      total_issues: stats.total_issues,
      completion_rate: stats.completion_rate,
    },
  };
};

// 4. User Context Helper
export const userContextHelper = () => ({
  // Mock - would come from auth context
  id: "user-1",
  email: "user@vangraph.dev",
  name: "Developer",
  role: "admin",
  permissions: ["read", "write", "delete", "admin"],
  is_oncall: false,
});

// 5. Current Spec State Helper
export const currentSpecStateHelper = () => ({
  // Would need issue context to fetch actual spec
  has_pending_spec: false,
  last_spec_version: null,
  awaiting_approval: false,
});

// 6. Active Git Branch Helper
export const activeGitBranchHelper = () => ({
  // Mock - would integrate with MCP git server
  branch: "main",
  last_commits: [
    { sha: "abc1234", message: "feat: Add dashboard components", author: "Developer" },
    { sha: "def5678", message: "fix: Resolve auth issue", author: "Developer" },
  ],
  uncommitted_changes: 0,
});

// 7. Available MCP Capabilities Helper
export const availableMcpCapabilitiesHelper = () => ({
  // Mock - would query actual MCP servers
  connected_servers: [
    { name: "supabase", status: "healthy", tools: ["query", "insert", "update"] },
    { name: "github", status: "healthy", tools: ["read_file", "list_dir", "search"] },
  ],
  total_tools: 6,
});

// 8. Current Linter Errors Helper
export const currentLinterErrorsHelper = () => ({
  // Mock - would integrate with terminal/MCP
  errors: 0,
  warnings: 2,
  last_run: new Date().toISOString(),
  details: [
    { file: "src/app/page.tsx", line: 15, message: "Unused variable", severity: "warning" },
  ],
});

// 9. ACON Compression Ratio Helper
export const aconCompressionRatioHelper = () => ({
  // Mock - would integrate with ACON system
  raw_tokens: 5000,
  compressed_tokens: 2500,
  compression_ratio: 0.5,
  memory_usage_percent: 25,
  last_compression: null,
});

// 10. Recent Reasoning Trace Helper
export const recentReasoningTraceHelper = () => ({
  // Mock - would fetch from reasoning_logs
  last_thoughts: [
    { step: 1, type: "observation", content: "User requested to create an issue" },
    { step: 2, type: "plan", content: "Will use createIssue tool" },
  ],
  total_log_entries: 2,
});

// 11. Governance Requirements Helper
export const governanceRequirementsHelper = () => ({
  // Mock - would check pending gates
  pending_gates: [],
  requires_spec_approval: true,
  requires_code_review: true,
  can_self_approve: false,
});

// Export all helpers in Tambo format (Record<string, ContextHelperFn>)
export const contextHelpers = {
  current_time: currentTimeHelper,
  active_workspace: activeWorkspaceHelper,
  active_project: activeProjectHelper,
  user_context: userContextHelper,
  current_spec_state: currentSpecStateHelper,
  active_git_branch: activeGitBranchHelper,
  available_mcp_capabilities: availableMcpCapabilitiesHelper,
  current_linter_errors: currentLinterErrorsHelper,
  acon_compression_ratio: aconCompressionRatioHelper,
  recent_reasoning_trace: recentReasoningTraceHelper,
  governance_requirements: governanceRequirementsHelper,
};
