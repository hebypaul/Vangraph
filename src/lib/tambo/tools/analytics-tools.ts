// Tambo Tools - Analytics & Sprint Operations
import { z } from "zod";
import { getProjectStats } from "@/services/supabase/projects";
import { getActiveSprint, getSprintProgress } from "@/services/supabase/sprints";

// Get Project Stats Tool
export const getProjectStatsTool = {
  name: "getProjectStats",
  description: "Get analytics and statistics for a project including issue counts, completion rate, and velocity",
  parameters: z.object({
    projectId: z.string().describe("The project ID"),
  }),
  handler: async ({ projectId }: { projectId: string }) => {
    const stats = await getProjectStats(projectId);
    
    return {
      success: true,
      stats: {
        total_issues: stats.total_issues,
        completed_issues: stats.completed_issues,
        in_progress_issues: stats.in_progress_issues,
        blocked_issues: stats.blocked_issues,
        completion_rate: `${stats.completion_rate}%`,
        velocity: stats.velocity,
        active_sprint: stats.active_sprint ? {
          name: stats.active_sprint.name,
          end_date: stats.active_sprint.end_date,
        } : null,
      },
    };
  },
};

// Get Active Sprint Tool
export const getActiveSprintTool = {
  name: "getActiveSprint",
  description: "Get the currently active sprint for a project",
  parameters: z.object({
    projectId: z.string().describe("The project ID"),
  }),
  handler: async ({ projectId }: { projectId: string }) => {
    const sprint = await getActiveSprint(projectId);
    
    if (!sprint) {
      return {
        success: true,
        hasActiveSprint: false,
        message: "No active sprint found",
      };
    }
    
    return {
      success: true,
      hasActiveSprint: true,
      sprint: {
        id: sprint.id,
        name: sprint.name,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        velocity_target: sprint.velocity_target,
      },
    };
  },
};

// Get Sprint Progress Tool
export const getSprintProgressTool = {
  name: "getSprintProgress",
  description: "Get detailed progress for a sprint including burndown data",
  parameters: z.object({
    sprintId: z.string().describe("The sprint ID"),
  }),
  handler: async ({ sprintId }: { sprintId: string }) => {
    const progress = await getSprintProgress(sprintId);
    
    return {
      success: true,
      sprint: {
        name: progress.sprint.name,
        start_date: progress.sprint.start_date,
        end_date: progress.sprint.end_date,
      },
      progress: {
        total_points: progress.total_points,
        completed_points: progress.completed_points,
        remaining_points: progress.remaining_points,
        completion_percentage: Math.round((progress.completed_points / progress.total_points) * 100),
      },
      burndown: progress.burndown,
    };
  },
};

// Estimate Complexity Tool
export const estimateComplexityTool = {
  name: "estimateComplexity",
  description: "Estimate story points for an issue based on similar past issues",
  parameters: z.object({
    title: z.string().describe("Issue title"),
    description: z.string().optional().describe("Issue description"),
    type: z.enum(["feature", "bug", "task", "spike"]).optional().describe("Issue type"),
  }),
  handler: async ({ title, description, type }: {
    title: string;
    description?: string;
    type?: string;
  }) => {
    // Simple estimation logic (in real implementation, use ML/historical data)
    const keywords = (title + ' ' + (description || '')).toLowerCase();
    
    let basePoints = 3; // Default medium complexity
    
    // Increase for certain keywords
    if (keywords.includes('integration') || keywords.includes('api')) basePoints += 2;
    if (keywords.includes('migration') || keywords.includes('refactor')) basePoints += 3;
    if (keywords.includes('auth') || keywords.includes('security')) basePoints += 2;
    if (keywords.includes('database') || keywords.includes('schema')) basePoints += 2;
    
    // Decrease for simple tasks
    if (keywords.includes('fix') || keywords.includes('typo')) basePoints -= 1;
    if (keywords.includes('update') || keywords.includes('minor')) basePoints -= 1;
    if (type === 'bug') basePoints -= 1;
    
    // Clamp to valid range
    const estimate = Math.max(1, Math.min(13, basePoints));
    
    const confidence = estimate <= 3 ? 'high' : estimate <= 8 ? 'medium' : 'low';
    
    return {
      success: true,
      estimate: {
        points: estimate,
        confidence,
        fibonacci_suggestion: [1, 2, 3, 5, 8, 13].find(n => n >= estimate) || 13,
      },
      rationale: `Based on keywords and type, estimated at ${estimate} points with ${confidence} confidence.`,
    };
  },
};

// Map Dependency Graph Tool
export const mapDependencyGraphTool = {
  name: "mapDependencyGraph",
  description: "Get a graph of issue dependencies and blockers",
  parameters: z.object({
    projectId: z.string().describe("The project ID"),
  }),
  handler: async ({ projectId }: { projectId: string }) => {
    // Mock implementation - would query actual dependencies
    return {
      success: true,
      graph: {
        nodes: [
          { id: "1", label: "VAN-001", type: "issue" },
          { id: "2", label: "VAN-002", type: "issue" },
          { id: "3", label: "VAN-003", type: "issue" },
        ],
        edges: [
          { from: "1", to: "2", type: "blocks" },
          { from: "2", to: "3", type: "depends_on" },
        ],
      },
      blockers: [
        { blocker: "VAN-001", blocked: "VAN-002", reason: "API required" },
      ],
    };
  },
};
