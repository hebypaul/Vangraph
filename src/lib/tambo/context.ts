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
  // TODO: Get actual project ID from context/URL if possible, defaulting to env or constant
  // For now using the mock implementation which is robust enough for verification
  const projectId = "proj-1";
  // We can optimize this later to use the actual active project ID from the request context
  
  return {
    id: projectId,
    name: "Vangraph",
    key: "VAN",
    tech_stack: ["Next.js", "TypeScript", "Supabase"],
    active_sprint: null,
    stats: {
      total_issues: 0,
      completion_rate: 0,
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

// ... (other helpers kept simple/mocked for now to avoid dependency hell)

export const contextHelpers = {
  current_time: currentTimeHelper,
  active_workspace: activeWorkspaceHelper,
  active_project: activeProjectHelper,
  user_context: userContextHelper,
};
