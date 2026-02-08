"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@/components/atomic/overlay/Tooltip";
import {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";
import type { Project } from "@/types";

interface SidebarUser {
  fullName?: string | null;
  email?: string;
  avatarUrl?: string | null;
}

interface SidebarProps {
  className?: string;
  user?: SidebarUser;
  projects?: Project[];
}

const navItems = [
  { 
    href: "/", 
    icon: LayoutDashboard, 
    label: "Dashboard",
    description: "Overview & stats"
  },
  // Projects handled separately
  { 
    href: "/board", 
    icon: Kanban, 
    label: "Board",
    description: "Kanban view"
  },
  { 
    href: "/sprints", 
    icon: CalendarDays, 
    label: "Sprints",
    description: "Sprint planning"
  },

  { 
    href: "/chat", 
    icon: MessageSquare, 
    label: "AI Chat",
    description: "Chat with Vangraph"
  },
  { 
    href: "/analytics", 
    icon: BarChart3, 
    label: "Analytics",
    description: "Insights & reports"
  },
];

const systemItems = [
  { 
    href: "/settings", 
    icon: Settings, 
    label: "Settings",
    description: "Workspace settings"
  },
  { 
    href: "/help", 
    icon: HelpCircle, 
    label: "Help",
    description: "Documentation"
  },
];

export function Sidebar({ className, user, projects = [] }: SidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  
  // Get user display name and initials
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayProjects = projects.slice(0, 2);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-56" : "w-16",
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo & Brand */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-vg-primary to-vg-purple flex items-center justify-center shadow-lg shadow-vg-primary/25 transition-transform hover:scale-105 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={cn(
            "font-bold text-lg text-foreground whitespace-nowrap transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          )}>
            Vangraph
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden vg-scrollbar">
        <div className={cn(
          "px-3 mb-2 transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Workspace
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            
            const NavItem = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-vg-primary/15 text-vg-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-vg-primary")} />
                <span className={cn(
                  "font-medium whitespace-nowrap transition-all duration-200 origin-left",
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.href} content={item.label} side="right">
                  {NavItem}
                </Tooltip>
              );
            }
            
            return NavItem;
          })}

          {/* Projects Section */}
          <div className="mt-2">
            <button
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
              className={cn(
                "w-full flex items-center justify-between gap-3 h-10 px-3 rounded-xl transition-all duration-200 group relative text-muted-foreground hover:bg-muted hover:text-foreground",
                pathname.startsWith("/projects") && "text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "font-medium whitespace-nowrap transition-all duration-200 origin-left",
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                )}>
                  Projects
                </span>
              </div>
              {isExpanded && (
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", !isProjectsExpanded && "-rotate-90")} />
              )}
            </button>

            {/* Projects Submenu */}
            <div className={cn(
               "overflow-hidden transition-all duration-300 ease-in-out",
               isProjectsExpanded && isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="pl-4 mt-1 space-y-1 border-l border-border ml-5 my-1">
                {displayProjects.map(project => (
                  <Link
                    key={project.id}
                    href={`/board?project=${project.id}`}
                    className={cn(
                      "flex items-center gap-2 h-8 px-3 rounded-lg text-sm transition-colors",
                      pathname === `/projects/${project.id}` 
                        ? "bg-vg-primary/10 text-vg-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))}
                
                <Link
                   href="/projects"
                   className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <MoreHorizontal className="w-3 h-3" />
                  <span>View All Projects</span>
                </Link>

                <Link
                   href="/projects?create=true" 
                   className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-vg-primary hover:bg-vg-primary/10"
                >
                   <Plus className="w-3 h-3" />
                   <span>Create Project</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* System Navigation */}
      <div className="py-4 border-t border-border">
        <div className={cn(
          "px-3 mb-2 transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            System
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {systemItems.map((item) => {
            const isActive = pathname === item.href;
            
            const NavItem = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-vg-primary/15 text-vg-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-vg-surface"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "text-sm font-medium truncate transition-opacity duration-200",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  {item.label}
                </span>
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.href} content={item.label} side="right">
                  {NavItem}
                </Tooltip>
              );
            }
            
            return NavItem;
          })}
        </nav>
      </div>

      {/* User Section */}
      {user && (
        <div className="p-3 border-t border-border">
          <Tooltip content={displayName} side="right" disabled={isExpanded}>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-vg-surface transition-colors"
            >
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={displayName}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-vg-primary/20 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-vg-warning to-vg-danger flex items-center justify-center text-white text-xs font-bold ring-2 ring-vg-primary/20 shrink-0">
                  {initials}
                </div>
              )}
              <div className={cn(
                "flex-1 min-w-0 transition-opacity duration-200",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  View profile
                </p>
              </div>
            </Link>
          </Tooltip>
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-vg-surface transition-colors shadow-md"
      >
        {isExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
