"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@/components/atomic/overlay/Tooltip";
import {
  LayoutDashboard,
  Kanban,
  Bot,
  MessageSquare,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/board", icon: Kanban, label: "Kanban Board" },
  { href: "/sprints", icon: CalendarDays, label: "Sprints" },
  { href: "/agents", icon: Bot, label: "AI Agents" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const systemItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("vg-sidebar", className)}>
      {/* Logo */}
      <div className="mb-6">
        <Link href="/" className="block">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vg-primary to-vg-purple flex items-center justify-center shadow-lg shadow-vg-primary/25 transition-transform hover:scale-105">
            <span className="text-white font-black text-lg">V</span>
          </div>
        </Link>
      </div>

      {/* Workspace Navigation */}
      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
        Work
      </div>
      <nav className="flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href} content={item.label} side="right">
              <Link
                href={item.href}
                className={cn(
                  "vg-sidebar-item flex items-center justify-center",
                  isActive && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* System Navigation */}
      <div className="mt-auto flex flex-col gap-1 w-full px-2">
        <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
          System
        </div>
        {systemItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href} content={item.label} side="right">
              <Link
                href={item.href}
                className={cn(
                  "vg-sidebar-item flex items-center justify-center",
                  isActive && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* User Avatar */}
      <div className="mt-4 mb-2">
        <Tooltip content="John Doe" side="right">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vg-warning to-vg-danger flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
            JD
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}
