"use client";

import { withInteractable } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

// Schema for TaskCard
export const taskCardSchema = z.object({
  id: z.string().optional().describe("Task ID like 'VA-089'"),
  issueId: z.string().optional().describe("Alternative for Task ID"),
  title: z.string().describe("Task title"),
  description: z.string().optional().describe("Task description"),
  status: z.string().describe("Status: backlog, in-progress, etc."),
  priority: z.string().describe("Priority: low, medium, high, critical"),
  assignees: z.array(z.string()).optional().describe("Initials of assignees"),
  comments: z.number().optional().describe("Number of comments"),
  showDescription: z.boolean().default(true),
  isEditable: z.boolean().default(true),
});

export type TaskCardProps = z.infer<typeof taskCardSchema>;

// Direct props interface for base component
interface TaskCardBaseProps {
  id?: string;
  issueId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignees?: string[];
  comments?: number;
  showDescription?: boolean;
  isEditable?: boolean;
}

const priorityVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  low: "default",
  medium: "primary",
  high: "warning",
  critical: "danger",
};

// Base component - can be used directly in JSX
export function TaskCardBase({ 
  id,
  issueId,
  title, 
  description, 
  status: rawStatus, 
  priority: rawPriority, 
  assignees, 
  comments,
  showDescription = true 
}: TaskCardBaseProps) {
  // Normalize ID
  const displayId = id || issueId || "???";

  // Normalize status and priority for display/styling
  const status = rawStatus?.toLowerCase().replace('_', '-') || 'backlog';
  const priority = (rawPriority?.toLowerCase() || 'medium') as "low" | "medium" | "high" | "critical";

  // Safe priority variant check
  const badgeVariant = priorityVariants[priority] || "default";

  return (
    <div className="vg-card flex flex-col gap-3 group cursor-pointer">
      {/* Header: ID + Priority */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] text-muted-foreground font-mono">
          {displayId}
        </span>
        {(priority === "high" || priority === "critical") && (
          <Badge variant={badgeVariant}>
            {priority === "critical" ? "HIGH PRIORITY" : priority}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground group-hover:text-vg-primary transition-colors leading-tight">
        {title}
      </h4>

      {/* Description */}
      {showDescription && description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Footer: Assignees + Comments */}
      <div className="flex items-center justify-between mt-1">
        {/* Assignees */}
        {assignees && assignees.length > 0 && (
          <div className="flex items-center -space-x-1">
            {assignees.slice(0, 3).map((initials, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-vg-surface border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground"
              >
                {initials}
              </div>
            ))}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-vg-surface border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Comments */}
        {comments !== undefined && comments > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px]">{comments}</span>
          </div>
        )}
      </div>

      {/* Progress bar for in-progress tasks */}
      {status === "in-progress" && (
        <div className="vg-progress mt-1">
          <div className="vg-progress-bar" style={{ width: "60%" }} />
        </div>
      )}
    </div>
  );
}

// Interactable version for Tambo registry
export const TaskCard = withInteractable(TaskCardBase, {
  componentName: "TaskCard",
  description: "Displays a project task card with ID, title, priority, assignees, and progress",
  propsSchema: taskCardSchema,
});
