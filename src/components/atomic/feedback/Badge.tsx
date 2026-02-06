// Badge Component - Status & label indicators
"use client";

import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "xs" | "sm" | "md";
  className?: string;
  dot?: boolean;
}

const variants = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary border-primary/20",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-destructive/15 text-destructive border-destructive/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  outline: "bg-transparent border-border text-foreground",
};

const sizes = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const dotColors = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  secondary: "bg-secondary-foreground",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-destructive",
  info: "bg-blue-400",
  outline: "bg-foreground",
};

export function Badge({ 
  children, 
  variant = "default", 
  size = "sm",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Priority Badge
export interface PriorityBadgeProps {
  priority: "urgent" | "high" | "medium" | "low" | "none";
  size?: "xs" | "sm" | "md";
}

const priorityConfig = {
  urgent: { variant: "danger" as const, label: "Urgent", icon: "🔴" },
  high: { variant: "warning" as const, label: "High", icon: "🟠" },
  medium: { variant: "info" as const, label: "Medium", icon: "🟡" },
  low: { variant: "success" as const, label: "Low", icon: "🟢" },
  none: { variant: "outline" as const, label: "None", icon: "⚪" },
};

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <Badge variant={config.variant} size={size}>
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

// Status Badge
export interface StatusBadgeProps {
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
  size?: "xs" | "sm" | "md";
}

const statusConfig = {
  backlog: { variant: "outline" as const, label: "Backlog" },
  todo: { variant: "secondary" as const, label: "To Do" },
  in_progress: { variant: "primary" as const, label: "In Progress" },
  in_review: { variant: "info" as const, label: "In Review" },
  done: { variant: "success" as const, label: "Done" },
  cancelled: { variant: "danger" as const, label: "Cancelled" },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}
