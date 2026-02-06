// Avatar Component
"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "busy" | "away";
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
};

const statusSizes = {
  xs: "h-1.5 w-1.5 bottom-0 right-0",
  sm: "h-2 w-2 bottom-0 right-0",
  md: "h-2.5 w-2.5 bottom-0 right-0",
  lg: "h-3 w-3 bottom-0.5 right-0.5",
  xl: "h-4 w-4 bottom-0.5 right-0.5",
};

// Generate color from name
function getColorFromName(name: string): string {
  const colors = [
    "bg-primary",
    "bg-purple-600",
    "bg-pink-600",
    "bg-blue-600",
    "bg-cyan-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-red-600",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ 
  src, 
  alt, 
  name,
  size = "md", 
  className,
  showStatus = false,
  status = "offline",
}: AvatarProps) {
  const initials = name ? getInitials(name) : null;
  const bgColor = name ? getColorFromName(name) : "bg-muted";
  
  return (
    <div className="relative inline-flex">
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden font-medium",
          !src && bgColor,
          !src && "text-white",
          sizes[size],
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="h-[60%] w-[60%] text-muted-foreground" />
        )}
      </div>
      
      {showStatus && (
        <span
          className={cn(
            "absolute rounded-full ring-2 ring-background",
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}
