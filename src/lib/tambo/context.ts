import type { ContextHelpers } from "@tambo-ai/react";

/**
 * Context Helpers - provide AI with current state every message
 * Format: Record<string, ContextHelperFn> where key is context name
 */
export const contextHelpers: ContextHelpers = {
  current_time: () => ({
    time: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
  // TODO: Connect to actual project state via URL/Store
  active_project: () => ({
    project: "Project Phoenix", // Placeholder -> Replace with real active project
    sprint: "SPRINT-4",
    phase: "Phase 2: Agentic Swarm",
  }),
  // TODO: Connect to actual user session
  user_context: () => ({
    role: "product_manager", // Placeholder -> Replace with real user role
    name: "John Doe",
    permissions: ["view", "edit", "approve"],
  }),
};
