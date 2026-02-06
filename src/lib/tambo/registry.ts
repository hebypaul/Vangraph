// Tambo Registry - Component and Tool Registration
import { z } from "zod";

// Import all tools
import {
  getIssuesTool,
  createIssueTool,
  updateIssueTool,
  deleteIssueTool,
  getIssueByIdTool,
  getKanbanBoardTool,
} from "./tools/issue-tools";

import {
  generateTechnicalSpecTool,
  getSpecTool,
  getSpecVersionHistoryTool,
  approveSpecTool,
  verifyAgainstSpecTool,
} from "./tools/spec-tools";

import {
  getProjectStatsTool,
  getActiveSprintTool,
  getSprintProgressTool,
  estimateComplexityTool,
  mapDependencyGraphTool,
} from "./tools/analytics-tools";

import {
  pruneContextThreadTool,
  snapshotWorldStateTool,
  requestMcpAccessTool,
  auditCodebaseTool,
  checkGovernanceStatusTool,
  approveGovernanceGateTool,
} from "./tools/mcp-tools";

// Import context helpers
import { contextHelpers } from "./context/helpers";

// Define all tools for Tambo
export const tamboTools = [
  // Issue tools
  getIssuesTool,
  createIssueTool,
  updateIssueTool,
  deleteIssueTool,
  getIssueByIdTool,
  getKanbanBoardTool,
  
  // Spec tools
  generateTechnicalSpecTool,
  getSpecTool,
  getSpecVersionHistoryTool,
  approveSpecTool,
  verifyAgainstSpecTool,
  
  // Analytics tools
  getProjectStatsTool,
  getActiveSprintTool,
  getSprintProgressTool,
  estimateComplexityTool,
  mapDependencyGraphTool,
  
  // MCP tools
  pruneContextThreadTool,
  snapshotWorldStateTool,
  requestMcpAccessTool,
  auditCodebaseTool,
  checkGovernanceStatusTool,
  approveGovernanceGateTool,
];

// Component schemas for Tambo generative UI
export const componentSchemas = {
  // Issue Card Schema
  AIIssueCard: z.object({
    id: z.string(),
    key: z.string(),
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]),
    priority: z.enum(["urgent", "high", "medium", "low", "none"]),
    assignee: z.object({
      name: z.string(),
      avatar: z.string().optional(),
    }).optional(),
    estimate_points: z.number().optional(),
    has_spec: z.boolean().optional(),
    spec_approved: z.boolean().optional(),
  }),

  // Sprint Summary Schema
  AISprintSummary: z.object({
    name: z.string(),
    status: z.enum(["planned", "active", "completed"]),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    total_points: z.number(),
    completed_points: z.number(),
    remaining_points: z.number(),
    velocity: z.number().optional(),
    burndown: z.array(z.object({
      date: z.string(),
      remaining: z.number(),
    })).optional(),
  }),

  // Insights Schema
  AIInsights: z.object({
    insights: z.array(z.object({
      type: z.enum(["warning", "info", "success", "suggestion"]),
      title: z.string(),
      description: z.string(),
      action: z.string().optional(),
    })),
  }),

  // Blocker Graph Schema
  AIBlockerGraph: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(["issue", "blocker"]),
    })),
    edges: z.array(z.object({
      from: z.string(),
      to: z.string(),
      type: z.enum(["blocks", "depends_on"]),
    })),
  }),

  // Supervisor Gate Schema
  SupervisorGate: z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    entityType: z.enum(["spec", "issue", "pr", "deployment"]),
    entityId: z.string(),
    title: z.string(),
    summary: z.string(),
    requiredRole: z.string().optional(),
    riskScore: z.number().optional(),
  }),

  // Spec Approver Schema
  SpecApprover: z.object({
    specId: z.string(),
    issueKey: z.string(),
    version: z.number(),
    contentPreview: z.string(),
    status: z.enum(["pending", "approved", "rejected"]),
  }),

  // Task Decomposer Schema
  AITaskDecomposer: z.object({
    parentIssue: z.object({
      key: z.string(),
      title: z.string(),
    }),
    subtasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      estimate: z.number().optional(),
    })),
  }),
};

// Export context helpers
export { contextHelpers };

// Type exports
export type TamboTool = typeof tamboTools[number];
export type ComponentSchemas = typeof componentSchemas;
