// Progress Component
"use client";

import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger" | "rainbow";
  showLabel?: boolean;
  className?: string;
}

const heights = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const colors = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  rainbow: "bg-gradient-to-r from-primary via-purple-500 to-pink-500",
};

export function Progress({ 
  value, 
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className 
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div 
        className={cn(
          "w-full rounded-full bg-secondary overflow-hidden",
          heights[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular Progress
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
}

const strokeColors = {
  default: "stroke-primary",
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
  danger: "stroke-destructive",
};

export function CircularProgress({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  variant = "default",
  showLabel = false,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="stroke-secondary"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(strokeColors[variant], "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-medium">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
