import { z } from "zod";

// ============================================
// TASK SCHEMAS
// ============================================

// ============================================
// TASK SCHEMAS
// ============================================

export const taskSchema = z.object({
  id: z.string().describe("Task ID like 'VA-089'"),
  title: z.string().describe("Task title"),
  description: z.string().optional().describe("Task description"),
  status: z.enum(["backlog", "in-progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignees: z.array(z.string()).optional().describe("Initials of assignees"),
  comments: z.number().optional().describe("Number of comments"),
  epicId: z.string().optional(),
  sprintId: z.string().optional(),
});

export const taskCardSchema = z.object({
  id: z.string().optional().describe("Task ID like 'VA-089'"),
  issueId: z.string().optional().describe("Alternative for Task ID"),
  title: z.string().optional().default("Untitled Task").describe("Task title"),
  description: z.string().optional().default("").describe("Task description"),
  status: z.string().optional().default("backlog").describe("Status: backlog, in-progress, etc."),
  priority: z.string().optional().default("medium").describe("Priority: low, medium, high, critical"),
  assignees: z.array(z.string()).optional().default([]).describe("Initials of assignees"),
  comments: z.number().optional().default(0).describe("Number of comments"),
  showDescription: z.boolean().default(true),
  isEditable: z.boolean().default(true),
});

export type TaskCardProps = z.infer<typeof taskCardSchema>;

// ============================================
// PHASE/ROADMAP SCHEMAS
// ============================================

export const phaseCardSchema = z.object({
  phaseName: z.string().optional().default("New Phase").describe("Phase name like 'Phase 2: Agentic Swarm'"),
  phaseNumber: z.number().optional().default(1).describe("Phase number"),
  dateRange: z.string().optional().default("Date TBD").describe("Date range like 'Oct 10 - Oct 24'"),
  description: z.string().optional().default("").describe("Phase description"),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(["done", "in-progress", "pending"]).optional().default("pending"),
  })).optional().default([]),
  metrics: z.object({
    velocity: z.number().optional().default(0).describe("Sprint velocity in points"),
    teamActive: z.number().optional().default(0).describe("Number of active team members"),
    blockers: z.number().optional().default(0).describe("Number of critical blockers"),
  }).optional().default({
    velocity: 0,
    teamActive: 0,
    blockers: 0,
  }),
});

export type PhaseCard = z.infer<typeof phaseCardSchema>;

// ============================================
// PROJECT DASHBOARD SCHEMAS
// ============================================
export const projectDashboardSchema = z.object({
  projectName: z.string().optional().default("Project Overview").describe("Name of the project"),
  sprintName: z.string().optional().default("Current Sprint").describe("Current sprint name"),
  activeSprintId: z.string().uuid().optional(),
  totalTasks: z.number().optional().default(0),
  completedTasks: z.number().optional().default(0),
  inProgressTasks: z.number().optional().default(0),
  aiInsights: z.array(z.string()).optional().default([]).describe("Autonomous suggestions from the agent"),
});

export type ProjectDashboard = z.infer<typeof projectDashboardSchema>;

// ============================================
// AI INSIGHT SCHEMAS
// ============================================

export const aiInsightSchema = z.object({
  isStreaming: z.boolean().default(false).describe("Whether the AI is currently thinking"),
  message: z.string().describe("The AI's insight message"),
  linkedTickets: z.array(z.object({
    id: z.string(),
    title: z.string().optional().default("Untitled Ticket"), 
  })).optional().default([]).describe("Tickets mentioned in the insight"),
  suggestion: z.string().optional().describe("A specific suggestion the AI is making"),
});

export type AIInsight = z.infer<typeof aiInsightSchema>;

// ============================================
// AI CONSULTANT SCHEMAS (Interactable)
// ============================================

export const aiConsultantSchema = z.object({
  mode: z.enum(["refiner", "planner", "analyst"]),
  context: z.string().describe("What the AI is currently focusing on"),
  proposals: z.array(z.object({
    taskId: z.string(),
    suggestion: z.string(),
    action: z.enum(["update_status", "assign_sprint", "flag_duplicate"]),
  })).optional(),
});

export type AIConsultant = z.infer<typeof aiConsultantSchema>;

// ============================================
// SPRINT BOARD SCHEMAS
// ============================================

export const sprintBoardSchema = z.object({
  sprintName: z.string(),
  sprintId: z.string(),
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    tasks: z.array(taskSchema),
  })),
});


export const boardIssueDetailSchema = z.object({
  issueId: z.string().optional().describe("The ID of the issue to display details for, e.g. 'VA-123'"),
  id: z.string().optional().describe("Alternative for Issue ID"),
});

export type BoardIssueDetailProps = z.infer<typeof boardIssueDetailSchema>;

// ============================================
// SPEC EDITOR SCHEMAS
// ============================================

export const specEditorSchema = z.object({
  content: z.string().describe("The draft technical specification or plan in Markdown format"),
  status: z.enum(["draft", "approved", "rejected"]).describe("Current status of the plan"),
});

export type SpecEditorProps = z.infer<typeof specEditorSchema>;
