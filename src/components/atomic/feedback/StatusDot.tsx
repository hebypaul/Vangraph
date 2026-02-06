// StatusDot Component
"use client";

import { cn } from "@/lib/utils";

export interface StatusDotProps {
  status: "online" | "offline" | "busy" | "away" | "active" | "idle";
  size?: "xs" | "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const colors = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
  active: "bg-primary",
  idle: "bg-gray-400",
};

const sizes = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function StatusDot({ 
  status, 
  size = "sm", 
  pulse = false,
  className 
}: StatusDotProps) {
  return (
    <span className="relative inline-flex">
      <span
        className={cn(
          "rounded-full",
          colors[status],
          sizes[size],
          className
        )}
      />
      {pulse && (status === "online" || status === "active") && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colors[status]
          )}
        />
      )}
    </span>
  );
}
