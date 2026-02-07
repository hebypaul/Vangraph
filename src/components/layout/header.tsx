"use client";

import { cn } from "@/lib/utils";
import { Bell, Users } from "lucide-react";

interface HeaderProps {
  projectName?: string;
  sprintName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Header({ 
  projectName = "Project Phoenix", 
  sprintName = "SPRINT-4",
  className,
  children 
}: HeaderProps) {
  return (
    <header className={cn("vg-header", className)}>
      {/* Left: Project Info */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-foreground">{projectName}</h1>
        <span className="vg-badge vg-badge-primary">{sprintName}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Team Avatars */}
        <div className="flex items-center -space-x-2">
          <div className="w-7 h-7 rounded-full bg-vg-primary border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground">
            AR
          </div>
          <div className="w-7 h-7 rounded-full bg-vg-success border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground">
            QA
          </div>
          <div className="w-7 h-7 rounded-full bg-vg-purple border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
            +3
          </div>
        </div>

        {/* Notifications */}
        <button className="vg-btn-ghost p-2 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-vg-danger" />
        </button>

        {/* Custom children (e.g., UserNav) */}
        {children}
      </div>
    </header>
  );
}
