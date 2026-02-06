// Tambo Tools - Issue Operations
import { z } from "zod";
import { 
  getIssues, 
  getIssueById, 
  createIssue, 
  updateIssue, 
  deleteIssue,
  getIssuesByStatus,
  type IssueFilters
} from "@/services/supabase/issues";
import type { IssueStatus, Priority } from "@/types";

// Get Issues Tool
export const getIssuesTool = {
  name: "getIssues",
  description: "Query issues from a project with optional filters for status, priority, assignee, and search text",
  parameters: z.object({
    projectId: z.string().describe("The project ID to get issues from"),
    status: z.array(z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]))
      .optional()
      .describe("Filter by status(es)"),
    priority: z.array(z.enum(["urgent", "high", "medium", "low", "none"]))
      .optional()
      .describe("Filter by priority(ies)"),
    assigneeId: z.string().optional().describe("Filter by assignee user ID"),
    sprintId: z.string().optional().describe("Filter by sprint ID"),
    search: z.string().optional().describe("Search text for title/description"),
  }),
  handler: async ({ projectId, status, priority, assigneeId, sprintId, search }: {
    projectId: string;
    status?: IssueStatus[];
    priority?: Priority[];
    assigneeId?: string;
    sprintId?: string;
    search?: string;
  }) => {
    const filters: IssueFilters = {
      status,
      priority,
      assignee_id: assigneeId,
      sprint_id: sprintId,
      search,
    };
    
    const issues = await getIssues(projectId, filters);
    return {
      count: issues.length,
      issues: issues.map(i => ({
        id: i.id,
        key: i.key,
        title: i.title,
        status: i.status,
        priority: i.priority,
        assignee: i.assignee?.full_name || null,
      })),
    };
  },
};

// Create Issue Tool
export const createIssueTool = {
  name: "createIssue",
  description: "Create a new issue in a project. Returns the created issue with its generated key.",
  parameters: z.object({
    projectId: z.string().describe("The project ID to create the issue in"),
    title: z.string().describe("Issue title"),
    description: z.string().optional().describe("Issue description in markdown"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"])
      .optional()
      .default("backlog")
      .describe("Initial status"),
    priority: z.enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .default("medium")
      .describe("Issue priority"),
    assigneeId: z.string().optional().describe("Assign to user ID"),
    sprintId: z.string().optional().describe("Add to sprint ID"),
    estimatePoints: z.number().optional().describe("Story point estimate"),
  }),
  handler: async (params: {
    projectId: string;
    title: string;
    description?: string;
    status?: IssueStatus;
    priority?: Priority;
    assigneeId?: string;
    sprintId?: string;
    estimatePoints?: number;
  }) => {
    const issue = await createIssue({
      project_id: params.projectId,
      title: params.title,
      description: params.description,
      status: params.status,
      priority: params.priority,
      assignee_id: params.assigneeId,
      sprint_id: params.sprintId,
      estimate_points: params.estimatePoints,
    });
    
    return {
      success: true,
      issue: {
        id: issue.id,
        key: issue.key,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
      },
      message: `Created issue ${issue.key}: ${issue.title}`,
    };
  },
};

// Update Issue Tool
export const updateIssueTool = {
  name: "updateIssue",
  description: "Update an existing issue's fields",
  parameters: z.object({
    issueId: z.string().describe("The issue ID to update"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"])
      .optional()
      .describe("New status"),
    priority: z.enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("New priority"),
    assigneeId: z.string().nullable().optional().describe("New assignee (null to unassign)"),
    sprintId: z.string().nullable().optional().describe("New sprint (null to remove)"),
    estimatePoints: z.number().nullable().optional().describe("New estimate"),
  }),
  handler: async (params: {
    issueId: string;
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: Priority;
    assigneeId?: string | null;
    sprintId?: string | null;
    estimatePoints?: number | null;
  }) => {
    const { issueId, ...updates } = params;
    
    const issue = await updateIssue(issueId, {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      assignee_id: updates.assigneeId,
      sprint_id: updates.sprintId,
      estimate_points: updates.estimatePoints,
    });
    
    return {
      success: true,
      issue: {
        id: issue.id,
        key: issue.key,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
      },
      message: `Updated issue ${issue.key}`,
    };
  },
};

// Delete Issue Tool
export const deleteIssueTool = {
  name: "deleteIssue",
  description: "Archive/delete an issue (soft delete)",
  parameters: z.object({
    issueId: z.string().describe("The issue ID to delete"),
  }),
  handler: async ({ issueId }: { issueId: string }) => {
    await deleteIssue(issueId);
    return {
      success: true,
      message: "Issue archived successfully",
    };
  },
};

// Get Issue by ID Tool
export const getIssueByIdTool = {
  name: "getIssueById",
  description: "Get full details of a specific issue including spec, comments, and activity",
  parameters: z.object({
    issueId: z.string().describe("The issue ID to retrieve"),
  }),
  handler: async ({ issueId }: { issueId: string }) => {
    const issue = await getIssueById(issueId);
    if (!issue) {
      return { success: false, error: "Issue not found" };
    }
    
    return {
      success: true,
      issue: {
        id: issue.id,
        key: issue.key,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assignee: issue.assignee?.full_name || null,
        sprint: issue.sprint?.name || null,
        module: issue.module?.name || null,
        labels: issue.labels?.map(l => l.name) || [],
        estimate_points: issue.estimate_points,
        due_date: issue.due_date,
        has_spec: !!issue.spec,
        spec_approved: issue.spec?.is_approved || false,
      },
    };
  },
};

// Get Kanban Board Tool
export const getKanbanBoardTool = {
  name: "getKanbanBoard",
  description: "Get issues grouped by status for Kanban board display",
  parameters: z.object({
    projectId: z.string().describe("The project ID"),
  }),
  handler: async ({ projectId }: { projectId: string }) => {
    const grouped = await getIssuesByStatus(projectId);
    
    return {
      columns: Object.entries(grouped).map(([status, issues]) => ({
        status,
        count: issues.length,
        issues: issues.slice(0, 10).map(i => ({
          id: i.id,
          key: i.key,
          title: i.title,
          priority: i.priority,
        })),
      })),
    };
  },
};
