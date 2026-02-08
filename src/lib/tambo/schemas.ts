import { z } from "zod";

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

export type Task = z.infer<typeof taskSchema>;

export const taskCardSchema = z.object({
  task: taskSchema,
  showDescription: z.boolean().default(true),
  isEditable: z.boolean().default(true),
});

export type TaskCardProps = z.infer<typeof taskCardSchema>;



// ============================================
// PHASE/ROADMAP SCHEMAS
// ============================================

export const phaseCardSchema = z.object({
  phaseName: z.string().describe("Phase name like 'Phase 2: Agentic Swarm'"),
  phaseNumber: z.number().describe("Phase number"),
  dateRange: z.string().describe("Date range like 'Oct 10 - Oct 24'"),
  description: z.string().describe("Phase description"),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(["done", "in-progress", "pending"]),
  })),
  metrics: z.object({
    velocity: z.number().describe("Sprint velocity in points"),
    teamActive: z.number().describe("Number of active team members"),
    blockers: z.number().describe("Number of critical blockers"),
  }),
});

export type PhaseCard = z.infer<typeof phaseCardSchema>;

// ============================================
// PROJECT DASHBOARD SCHEMAS
// ============================================

export const projectDashboardSchema = z.object({
  projectName: z.string(),
  sprintName: z.string().optional(),
  activeSprintId: z.string().uuid().optional(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  inProgressTasks: z.number(),
  aiInsights: z.array(z.string()).describe("Autonomous suggestions from the agent"),
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
    title: z.string(),
  })).optional().describe("Tickets mentioned in the insight"),
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

export type SprintBoard = z.infer<typeof sprintBoardSchema>;
