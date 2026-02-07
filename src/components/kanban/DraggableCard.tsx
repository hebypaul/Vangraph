"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { GripVertical, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IssueWithKey } from "@/types";

interface DraggableCardProps {
  issue: IssueWithKey;
  onClick?: () => void;
}

const priorityVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  low: "default",
  none: "default",
  medium: "primary",
  high: "warning",
  urgent: "danger",
};

export function DraggableCard({ issue, onClick }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Format due date for display
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Overdue", class: "text-red-500" };
    if (diffDays === 0) return { label: "Today", class: "text-amber-500" };
    if (diffDays === 1) return { label: "Tomorrow", class: "text-amber-500" };
    if (diffDays <= 7) return { label: `${diffDays}d`, class: "text-muted-foreground" };
    return { label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), class: "text-muted-foreground" };
  };

  const dueDate = formatDueDate(issue.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "bg-card p-4 rounded-lg border shadow-sm",
        "touch-none cursor-grab active:cursor-grabbing",
        "transition-all duration-200",
        "hover:border-primary/50 hover:shadow-md",
        // Dragging state - Tailwind v4 compliant
        isDragging && [
          "opacity-50",
          "border-primary",
          "ring-2 ring-primary/20",
          "rotate-2",
          "scale-105",
          "z-50",
          "shadow-xl",
        ]
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Header: ID + Priority + Drag Handle */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground font-mono">
            {issue.key}
          </span>
        </div>
        {(issue.priority === "high" || issue.priority === "urgent") && (
          <Badge variant={priorityVariants[issue.priority]} className="text-[9px]">
            {issue.priority === "urgent" ? "URGENT" : "HIGH"}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-2">
        {issue.title}
      </h4>

      {/* Description Preview */}
      {issue.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {issue.description}
        </p>
      )}

      {/* Footer: Assignee, Due Date, Estimate */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Assignee Avatar */}
          {issue.assignee && (
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary">
              {(issue.assignee.full_name || issue.assignee.email)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}

          {/* Estimate Points */}
          {issue.estimate_points && (
            <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground">
              {issue.estimate_points}pt
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Due Date */}
          {dueDate && (
            <div className={clsx("flex items-center gap-1", dueDate.class)}>
              <Calendar className="w-3 h-3" />
              <span className="text-[10px]">{dueDate.label}</span>
            </div>
          )}

          {/* Comments placeholder */}
          <div className="flex items-center gap-1 text-muted-foreground/50">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px]">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
