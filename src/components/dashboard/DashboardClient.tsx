'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { UserNav } from '@/components/auth/UserNav';
import { AgentStatusCardBase } from '@/components/tambo/agent-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/atomic/button/Button';
import { Progress } from '@/components/atomic/feedback/Progress';
import { Skeleton } from '@/components/atomic/feedback/Skeleton';
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Settings,
  Shield,
} from 'lucide-react';

import { getProjectStats } from '@/services/supabase/projects';
import { getUserWorkspaces } from '@/actions/workspace';
import type { ProjectStats } from '@/types';
import type { UserRole } from '@/utils/rbac-client';
import { getRoleDisplayName, getRoleBadgeColor, ROLE_HIERARCHY } from '@/utils/rbac-client';

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
  role?: UserRole | null;
  workspaceId?: string;
}

// Quick actions - filtered by role
const getQuickActions = (role?: UserRole | null) => {
  const baseActions = [
    {
      href: '/chat',
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Talk to Vangraph AI',
      gradient: 'from-vg-primary to-cyan-400',
      minRole: 'viewer' as UserRole,
    },
    {
      href: '/board',
      icon: Kanban,
      title: 'Kanban Board',
      description: 'View sprint tasks',
      gradient: 'from-vg-purple to-pink-400',
      minRole: 'viewer' as UserRole,
    },
    {
      href: '/projects',
      icon: FolderKanban,
      title: 'Projects',
      description: 'Manage projects',
      gradient: 'from-vg-success to-emerald-400',
      minRole: 'member' as UserRole,
    },
    {
      href: '/sprints',
      icon: CalendarDays,
      title: 'Sprints',
      description: 'Sprint planning',
      gradient: 'from-vg-warning to-amber-400',
      minRole: 'manager' as UserRole,
    },
    {
      href: '/analytics',
      icon: BarChart3,
      title: 'Analytics',
      description: 'View insights',
      gradient: 'from-blue-500 to-indigo-400',
      minRole: 'manager' as UserRole,
    },
    {
      href: '/settings',
      icon: Settings,
      title: 'Settings',
      description: 'Workspace settings',
      gradient: 'from-gray-500 to-gray-400',
      minRole: 'admin' as UserRole,
    },
  ];

  const userLevel = role ? ROLE_HIERARCHY[role] : 0;
  return baseActions.filter(
    (action) => userLevel >= ROLE_HIERARCHY[action.minRole]
  );
};

// Mock agents data - would connect to agent monitoring service
const agents = [
  { name: 'Coder Agent', type: 'coder' as const, status: 'active' as const },
  { name: 'QA Agent', type: 'qa' as const, status: 'idle' as const },
  { name: 'Architect Agent', type: 'architect' as const, status: 'reviewing' as const },
];

export function DashboardClient({ user, role, workspaceId }: DashboardClientProps) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load workspace name
        const workspaces = await getUserWorkspaces();
        if (workspaces.length > 0) {
          const currentWorkspace = workspaceId 
            ? workspaces.find(w => w.id === workspaceId) 
            : workspaces[0];
          if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name);
          }
        }

        // Load project stats (using first project in workspace or default)
        if (workspaceId) {
          const projectStats = await getProjectStats(workspaceId);
          setStats(projectStats);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [workspaceId]);

  const completionRate = stats ? stats.completion_rate : 0;
  const quickActions = getQuickActions(role);
  const displayName = user.fullName || user.email.split('@')[0];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={{ fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }} />
      <div className="flex-1 ml-(--sidebar-width) flex flex-col">
        <Header 
          projectName={workspaceName || 'Vangraph'} 
          sprintName={stats?.active_sprint?.name || 'Sprint 1'}
        >
          {/* User navigation in header */}
          <div className="ml-auto">
            <UserNav 
              user={{
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
              }}
              role={role}
              workspaceName={workspaceName}
            />
          </div>
        </Header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Personalized Hero Section */}
            <section className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-vg-primary to-vg-purple flex items-center justify-center shadow-lg shadow-vg-primary/25 animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Welcome back, {displayName}!
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                {role && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(role)}`}>
                    <Shield className="w-3.5 h-3.5 inline mr-1" />
                    {getRoleDisplayName(role)}
                  </span>
                )}
                {workspaceName && (
                  <span className="text-muted-foreground">
                    in <strong>{workspaceName}</strong>
                  </span>
                )}
              </div>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {role === 'viewer' 
                  ? 'View projects and track progress with your team.'
                  : role === 'member'
                  ? 'Contribute to projects and collaborate with your team.'
                  : role === 'manager' || role === 'admin' || role === 'owner'
                  ? 'Autonomous Project Management powered by AI Agents.'
                  : 'Let Vangraph refine your backlog, plan sprints, and keep you unblocked.'
                }
              </p>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-4 gap-4">
              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-primary/20 flex items-center justify-center text-vg-primary">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.total_issues ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-success/20 flex items-center justify-center text-vg-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.completed_issues ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-warning/20 flex items-center justify-center text-vg-warning">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.in_progress_issues ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-danger/20 flex items-center justify-center text-vg-danger">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.blocked_issues ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Blockers</p>
                </div>
              </div>
            </section>

            {/* Sprint Progress */}
            <section className="vg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Sprint Progress
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stats?.active_sprint?.name || 'Sprint 1'} • {stats?.active_sprint?.start_date || 'Feb 1'} - {stats?.active_sprint?.end_date || 'Feb 14'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">IN PROGRESS</Badge>
                  <span className="text-2xl font-bold text-vg-primary">
                    {loading ? '...' : `${completionRate}%`}
                  </span>
                </div>
              </div>
              <Progress value={completionRate} variant="rainbow" size="md" />
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-vg-primary" />
                  <span className="text-sm text-muted-foreground">
                    Velocity:{' '}
                    <span className="font-bold text-foreground">
                      {stats?.velocity ?? 0} pts
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-vg-success" />
                  <span className="text-sm text-muted-foreground">
                    On track for completion
                  </span>
                </div>
              </div>
            </section>

            {/* AI Agents Status - Only for managers+ */}
            {(role === 'manager' || role === 'admin' || role === 'owner') && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Bot className="w-5 h-5 text-vg-primary" />
                    AI Agents
                  </h2>
                  <Link href="/agents">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <AgentStatusCardBase
                      key={agent.name}
                      name={agent.name}
                      type={agent.type}
                      status={agent.status}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Quick Actions - Filtered by role */}
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Quick Actions
              </h2>
              <div className={`grid gap-4 ${quickActions.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="vg-card flex flex-col items-center gap-3 group hover:border-vg-primary/50 text-center py-6"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-linear-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <action.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-vg-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Team Members - Only for admins+ */}
            {(role === 'admin' || role === 'owner') && (
              <section className="vg-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-vg-primary" />
                    Team Management
                  </h2>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm">
                      Manage Team
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invite team members, manage roles, and configure workspace settings.
                </p>
              </section>
            )}

            {/* Features Section */}
            <section className="vg-card">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-vg-primary" />
                Tambo Features
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: 'Generative Components',
                    desc: 'TaskCard, PhaseCard, AgentStatus',
                  },
                  {
                    name: 'Interactable Components',
                    desc: 'AIConsultant, SpecViewer',
                  },
                  {
                    name: 'Tools',
                    desc: 'getProjectStats, getTasks, createTask',
                  },
                  {
                    name: 'Context Helpers',
                    desc: 'current_time, active_sprint',
                  },
                  {
                    name: 'MCP Integration',
                    desc: 'Supabase MCP server ready',
                  },
                  {
                    name: 'Conversation Storage',
                    desc: 'Built-in thread history',
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vg-success mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {feature.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
