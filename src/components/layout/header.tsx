"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Bell, 
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Building2,
  Menu
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { getRoleDisplayName, getRoleBadgeColor, type UserRole } from "@/utils/rbac-client";

interface HeaderUser {
  id?: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

interface HeaderProps {
  projectName?: string;
  sprintName?: string;
  className?: string;
  user?: HeaderUser;
  role?: UserRole | null;
  workspaceName?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ 
  projectName = "Vangraph", 
  sprintName,
  className,
  user,
  role,
  workspaceName,
  onMenuClick,
  showMobileMenu = false
}: HeaderProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // User display helpers
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6",
      className
    )}>
      {/* Left Section: Mobile Menu + Branding */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {showMobileMenu && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-vg-surface transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        
        {/* Project Name & Sprint Badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-foreground hidden sm:block">
            {projectName}
          </h1>
          {sprintName && (
            <span className="vg-badge vg-badge-primary hidden sm:inline-flex">
              {sprintName}
            </span>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, sprints..."
            className="w-full h-10 pl-10 pr-4 bg-vg-surface/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-vg-primary/50 focus:border-vg-primary/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background/50 border border-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section: Actions + User */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search */}
        <button className="md:hidden p-2 rounded-lg hover:bg-vg-surface transition-colors">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-vg-surface transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vg-danger ring-2 ring-background" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-border" />

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-vg-surface transition-colors"
            >
              {/* Avatar */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-vg-primary/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-vg-primary to-vg-purple flex items-center justify-center ring-2 ring-vg-primary/20">
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
              )}
              
              {/* User Info (Desktop only) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {displayName}
                </p>
                {workspaceName && (
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {workspaceName}
                  </p>
                )}
              </div>
              
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform hidden md:block",
                userMenuOpen && "rotate-180"
              )} />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)} 
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
                  {/* User Header */}
                  <div className="p-4 bg-linear-to-r from-vg-primary/10 to-vg-purple/10 border-b border-border">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={displayName}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-vg-primary/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-vg-primary to-vg-purple flex items-center justify-center ring-2 ring-vg-primary/30">
                          <span className="text-sm font-bold text-white">{initials}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Role & Workspace */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {workspaceName && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-lg">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{workspaceName}</span>
                        </div>
                      )}
                      {role && (
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-lg border",
                          getRoleBadgeColor(role)
                        )}>
                          {getRoleDisplayName(role)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-vg-surface rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-vg-surface rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2 border-t border-border">
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-vg-danger hover:bg-vg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
