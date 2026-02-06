// Skeleton Component - Loading placeholders
"use client";

import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };
  
  if (variant === "circular") {
    return (
      <div
        className={cn(baseClasses, "rounded-full", className)}
        style={{ ...style, aspectRatio: 1 }}
      />
    );
  }
  
  if (variant === "text" || lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, "h-4", i === lines - 1 && lines > 1 && "w-3/4")}
            style={i === 0 ? style : undefined}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div
      className={cn(baseClasses, className)}
      style={style}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={16} className="w-1/2 mb-1" />
          <Skeleton variant="text" height={12} className="w-1/3" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          height={16} 
          className={cn(
            i === 0 ? "w-12" : "flex-1",
            i === columns - 1 && "w-20"
          )}
        />
      ))}
    </div>
  );
}
