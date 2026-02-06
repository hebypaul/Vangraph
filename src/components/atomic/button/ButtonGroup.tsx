// ButtonGroup Component
"use client";

import { cn } from "@/lib/utils";

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function ButtonGroup({ 
  children, 
  className,
  orientation = "horizontal" 
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex",
        orientation === "horizontal" 
          ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:last-child)]:border-r-0"
          : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:last-child)]:border-b-0",
        className
      )}
    >
      {children}
    </div>
  );
}
