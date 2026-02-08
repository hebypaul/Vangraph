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
} from "lucide-react";
import { useState } from "react";

interface SidebarUser {
  fullName?: string | null;
  email?: string;
  avatarUrl?: string | null;
}

interface SidebarProps {
  className?: string;
  user?: SidebarUser;
}

const navItems = [
  { 
    href: "/", 
    icon: LayoutDashboard, 
    label: "Dashboard",
    description: "Overview & stats"
  },
  { 
    href: "/projects", 
    icon: FolderKanban, 
    label: "Projects",
    description: "Manage projects"
  },
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

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get user display name and initials
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
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
                    : "text-muted-foreground hover:text-foreground hover:bg-vg-surface"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-vg-primary rounded-r-full" />
                )}
                
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                
                <div className={cn(
                  "flex flex-col min-w-0 transition-opacity duration-200",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}>
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                </div>
              </Link>
            );

            // Only show tooltip when collapsed
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
