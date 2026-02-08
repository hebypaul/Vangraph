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

// 3. Active Project Helper Factory
export const createActiveProjectHelper = (project: { id: string; name: string; key?: string } | null) => async () => {
  if (!project) {
    return {
      id: "unknown",
      name: "No Project Selected",
      key: "N/A",
      error: "No active project context found",
    };
  }
  
  // We can try to fetch more stats here if needed, or just return the basic info
  // For now, let's return the basic info + fetch stats if possible, but safely catch
  let stats = { total_issues: 0, completion_rate: 0 };
  try {
     const fetchedStats = await getProjectStats(project.id);
     stats = {
        total_issues: fetchedStats.total_issues,
        completion_rate: fetchedStats.completion_rate
     };
  } catch (e) {
     // Ignore stats fetch error context
  }

  return {
    id: project.id,
    name: project.name,
    key: project.key || "PRJ",
    tech_stack: ["Next.js", "TypeScript", "Supabase"],
    active_sprint: null,
    stats,
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

// 5. Navigation Helper (Dynamic)
export const createNavigationHelper = (project: { id: string; name: string; key?: string } | null, currentPath: string = "/board") => () => ({
  current_view: currentPath.includes("board") ? "Kanban Board" : 
               currentPath.includes("list") ? "List View" : 
               currentPath.includes("roadmap") ? "Roadmap" : "Unknown",
  active_project_id: project?.id || "none",
  active_tab: "tasks", // Mock for now, could be dynamic
  url_params: `projectId=${project?.id || ""}`,
});

// 6. Schema Constraints Helper (Static but vital)
export const schemaConstraintsHelper = () => ({
  issue_status: {
    backlog: "Backlog",
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    done: "Done",
    cancelled: "Cancelled"
  },
  issue_priority: ["urgent", "high", "medium", "low", "none"],
  phases: ["Planning", "Design", "Development", "Testing", "Deployment"],
});

// Factory for all helpers
export const createContextHelpers = (
  project: { id: string; name: string; key?: string } | null,
  currentPath: string = "/board" // Default path if not provided
) => ({
  current_time: currentTimeHelper,
  active_workspace: activeWorkspaceHelper,
  active_project: createActiveProjectHelper(project),
  user_context: userContextHelper,
  navigation: createNavigationHelper(project, currentPath),
  schema_constraints: schemaConstraintsHelper,
});

// Legacy export for backward compatibility (if used elsewhere)
export const contextHelpers = {
  current_time: currentTimeHelper,
  active_workspace: activeWorkspaceHelper,
  active_project: async () => ({ id: "default", name: "Default Project" }), // Placeholder
  user_context: userContextHelper,
  navigation: () => ({ current_view: "Unknown", active_project_id: "default" }),
  schema_constraints: schemaConstraintsHelper,
};
