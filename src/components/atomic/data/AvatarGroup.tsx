// AvatarGroup Component
"use client";

import { cn } from "@/lib/utils";
import { Avatar, type AvatarProps } from "./Avatar";

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({ 
  avatars, 
  max = 4,
  size = "sm",
  className 
}: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayed.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      
      {remaining > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
            size === "xs" && "h-6 w-6 text-[10px]",
            size === "sm" && "h-8 w-8 text-xs",
            size === "md" && "h-10 w-10 text-sm",
            size === "lg" && "h-12 w-12 text-base",
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
