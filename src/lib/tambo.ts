/**
 * @file tambo.ts
 * @description Central configuration for Tambo components and tools - Vangraph MVP
 */

import { BoardIssueDetail } from "@/components/tambo/board-issue-detail";
import { SpecEditor } from "@/components/tambo/spec-editor";
import {
  taskCardSchema,
  phaseCardSchema,
  projectDashboardSchema,
  aiInsightSchema,
  aiConsultantSchema,
  sprintBoardSchema,
  boardIssueDetailSchema,
  specEditorSchema,
} from "./tambo/schemas";
import { TaskCard } from "@/components/tambo/task-card";

import { PhaseCard } from "@/components/tambo/phase-card";
import { ProjectDashboard } from "@/components/tambo/project-dashboard";
import { AIInsight } from "@/components/tambo/ai-insight";
import { AIConsultant } from "@/components/tambo/ai-consultant";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Import services
import { getProjectStats } from "@/services/supabase/projects";
import { getIssues, createIssue, updateIssue, resolveIssueId } from "@/services/supabase/issues";
import { DEFAULT_PROJECT_ID } from "./constants";

// ============================================
// TOOLS (connected to Supabase services)
// ============================================

// ============================================
// TOOLS (connected to Supabase services)
// ============================================

export const createTools = (projectId: string = DEFAULT_PROJECT_ID): TamboTool[] => [
  {
    name: "getProjectStats",
    description: "Get current project statistics including task counts by status, velocity, and completion rate",
    tool: async () => {
      try {
        const stats = await getProjectStats(projectId);
        return {
          totalTasks: stats.total_issues,
          completedTasks: stats.completed_issues,
          inProgressTasks: stats.in_progress_issues,
          backlogTasks: stats.total_issues - stats.completed_issues - stats.in_progress_issues,
          velocity: stats.velocity,
          completionRate: stats.completion_rate,
          blockers: stats.blocked_issues,
        };
      } catch (error) {
        return { error: `Failed to fetch stats: ${error}` };
      }
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      totalTasks: z.number(),
      completedTasks: z.number(),
      inProgressTasks: z.number(),
      backlogTasks: z.number(),
      velocity: z.number(),
      completionRate: z.number().optional(),
      blockers: z.number(),
      error: z.string().optional(),
    }),
  },
  {
    name: "getTasks",
    description: "Fetch tasks from the project, optionally filtered by status. Returns task ID, title, status, and priority.",
    tool: async (input: { status?: string }) => {
      try {
        const filters: { status?: string[] } = {};
        if (input.status) {
          // Map friendly status names to DB values
          const statusMap: Record<string, string> = {
            "backlog": "backlog",
            "todo": "todo",
            "in-progress": "in_progress",
            "in_progress": "in_progress",
            "review": "in_review",
            "in_review": "in_review",
            "done": "done",
          };
          const mappedStatus = statusMap[input.status.toLowerCase()] || input.status;
          filters.status = [mappedStatus];
        }
        
        const issues = await getIssues(projectId, filters as unknown as Parameters<typeof getIssues>[1]);
        
        return issues.map(issue => ({
          id: issue.key,
          title: issue.title,
          description: issue.description || "",
          status: issue.status,
          priority: issue.priority,
          assignees: issue.assignee ? 
            (Array.isArray(issue.assignee) ? issue.assignee : [issue.assignee])
              .map((a: any) => a.full_name ? a.full_name.substring(0, 2).toUpperCase() : "U") 
            : [],
          comments: 0 // Placeholder as count not in default fetch
        }));
      } catch (error) {
        return [{ id: "error", title: `Failed to fetch: ${error}`, status: "error", priority: "low" }];
      }
    },
    inputSchema: z.object({
      status: z.string().optional().describe("Filter by status: backlog, todo, in-progress, review, done"),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.string(),
      priority: z.string(),
      assignees: z.array(z.string()).optional(),
      comments: z.number().optional(),
    })),
  },
  {
    name: "createTask",
    description: "Create a new task in the project with a title, optional description, and priority",
    tool: async (input: { title: string; description?: string; priority?: string }) => {
      try {
        // Safe validation of priority
        const validPriorities = ["urgent", "high", "medium", "low", "none"];
        let priority = (input.priority || "medium").toLowerCase();
        if (!validPriorities.includes(priority)) {
           priority = "medium"; // Fallback safety
        }

        const issue = await createIssue({
          project_id: projectId,
          title: input.title,
          description: input.description,
          priority: priority as "urgent" | "high" | "medium" | "low" | "none",
          status: "backlog",
        });
        
        return {
          id: issue.key,
          title: issue.title,
          description: issue.description || "",
          status: issue.status,
          priority: issue.priority,
          success: true,
        };
      } catch (error) {
        return {
          id: "error",
          title: input.title,
          description: "",
          status: "error",
          priority: "medium",
          success: false,
          error: `Failed to create: ${error}`,
        };
      }
    },
    inputSchema: z.object({
      title: z.string().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional().describe("Task priority (default: medium)"),
    }),
    outputSchema: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.string(),
      priority: z.string(),
      success: z.boolean().optional(),
      error: z.string().optional(),
    }),
  },
  {
    name: "updateTaskStatus",
    description: "Move a task to a different status column. MUST use exact status keys.",
    tool: async (input: { issueId: string; newStatus: string }) => {
      try {
        // Resolve ID (handles "VAN-123" -> UUID)
        const dbId = await resolveIssueId(input.issueId, projectId);
        if (!dbId) {
          return { success: false, error: `Issue not found: '${input.issueId}'. Check if the ID or Project Key is correct.` };
        }

        // Status validation
        const validStatuses = ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"];
        const statusMap: Record<string, string> = {
          "in-progress": "in_progress",
          "review": "in_review",
          "in-review": "in_review",
          "todo": "todo", 
          "done": "done",
          "backlog": "backlog",
          "cancelled": "cancelled"
        };
        const mappedStatus = statusMap[input.newStatus.toLowerCase()] || input.newStatus.toLowerCase();
        
        if (!validStatuses.includes(mappedStatus)) {
          return { success: false, error: `Invalid status '${input.newStatus}'. Mapped to '${mappedStatus}'. Valid options: ${validStatuses.join(", ")}` };
        }
        
        const issue = await updateIssue(dbId, { 
          status: mappedStatus as "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled"
        });
        
        return {
          success: true,
          id: issue.key,
          title: issue.title,
          newStatus: issue.status,
        };
      } catch (error: any) {
        const errorMessage = error?.message || JSON.stringify(error);
        console.error("Tool Execution Error (updateTaskStatus):", errorMessage);
        return { success: false, error: `Failed to update: ${errorMessage}` };
      }
    },
    inputSchema: z.object({
      issueId: z.string().describe("The issue ID to update (e.g., 'VA-123' or the database UUID)"),
      newStatus: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled", "review", "in-progress"])
        .describe("The target column ID. Map user intent (e.g. 'Review') to these exact keys."),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      id: z.string().optional(),
      title: z.string().optional(),
      newStatus: z.string().optional(),
      error: z.string().optional(),
    }),
  },

];

// Keep backward compatibility if needed, but we should prefer createTools
export const tools = createTools(DEFAULT_PROJECT_ID);

// ============================================
// COMPONENTS
// ============================================

export const components: TamboComponent[] = [
  {
    name: "TaskCard",
    description: "Displays a project task with ID, title, priority, assignees, and progress. Use for showing individual tasks.",
    propsSchema: taskCardSchema,
    component: TaskCard,
  },

  {
    name: "PhaseCard",
    description: "Displays a project phase with progress stepper and metrics. Use for roadmap views.",
    propsSchema: phaseCardSchema,
    component: PhaseCard,
  },
  {
    name: "ProjectDashboard",
    description: "High-level project overview with task counts and AI insights. Use for project summaries.",
    propsSchema: projectDashboardSchema,
    component: ProjectDashboard,
  },
  {
    name: "AIInsight",
    description: "Displays AI-generated insights and suggestions. Use for showing AI analysis results.",
    propsSchema: aiInsightSchema,
    component: AIInsight,
  },
  {
    name: "AIConsultant",
    description: "Interactive AI panel that proposes actions (refining, planning, analysis). Use for autonomous suggestions.",
    propsSchema: aiConsultantSchema,
    component: AIConsultant,
  },
  {
    name: "BoardIssueDetail",
    description: "Display a button to view details for a specific issue. Use when discussing a specific task or bug.",
    propsSchema: boardIssueDetailSchema,
    component: BoardIssueDetail,
  },
  {
    name: "SpecEditor",
    description: "Display a Markdown implementation plan for user review. Use this BEFORE executing complex changes or batch operations. The user must approve this plan.",
    propsSchema: specEditorSchema,
    component: SpecEditor,
  },
];
