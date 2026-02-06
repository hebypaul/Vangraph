"use client";

import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AgentStatusCardBase } from "@/components/tambo/agent-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/atomic/button/Button";
import { Progress } from "@/components/atomic/feedback/Progress";
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
} from "lucide-react";

// Mock project stats - would come from getProjectStats service
const projectStats = {
  totalTasks: 24,
  completedTasks: 8,
  inProgressTasks: 6,
  backlogTasks: 10,
  velocity: 42,
  blockers: 1,
};

// Mock agents data - would come from getAgentStatus service
const agents = [
  { name: "Coder Agent", type: "coder" as const, status: "active" as const },
  { name: "QA Agent", type: "qa" as const, status: "idle" as const },
  { name: "Architect Agent", type: "architect" as const, status: "reviewing" as const },
];

// Quick action cards configuration
const quickActions = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "AI Chat",
    description: "Talk to Vangraph AI",
    gradient: "from-vg-primary to-cyan-400",
    bgHover: "group-hover:bg-vg-primary",
  },
  {
    href: "/board",
    icon: Kanban,
    title: "Kanban Board",
    description: "View sprint tasks",
    gradient: "from-vg-purple to-pink-400",
    bgHover: "group-hover:bg-vg-purple",
  },
  {
    href: "/projects",
    icon: FolderKanban,
    title: "Projects",
    description: "Manage projects",
    gradient: "from-vg-success to-emerald-400",
    bgHover: "group-hover:bg-vg-success",
  },
  {
    href: "/sprints",
    icon: CalendarDays,
    title: "Sprints",
    description: "Sprint planning",
    gradient: "from-vg-warning to-amber-400",
    bgHover: "group-hover:bg-vg-warning",
  },
];

export default function Home() {
  const completionRate = Math.round(
    (projectStats.completedTasks / projectStats.totalTasks) * 100
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col">
        <Header projectName="Vangraph" sprintName="Sprint 1" />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <section className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vg-primary to-vg-purple flex items-center justify-center shadow-lg shadow-vg-primary/25 animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Welcome to Vangraph
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Autonomous Project Management powered by AI Agents. Let Vangraph
                refine your backlog, plan sprints, and keep your team unblocked.
              </p>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-4 gap-4">
              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-primary/20 flex items-center justify-center text-vg-primary">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {projectStats.totalTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-success/20 flex items-center justify-center text-vg-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {projectStats.completedTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-warning/20 flex items-center justify-center text-vg-warning">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {projectStats.inProgressTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="vg-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-vg-danger/20 flex items-center justify-center text-vg-danger">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {projectStats.blockers}
                  </p>
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
                    Sprint 1 • Feb 1 - Feb 14
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">IN PROGRESS</Badge>
                  <span className="text-2xl font-bold text-vg-primary">
                    {completionRate}%
                  </span>
                </div>
              </div>
              <Progress value={completionRate} variant="rainbow" size="md" />
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-vg-primary" />
                  <span className="text-sm text-muted-foreground">
                    Velocity:{" "}
                    <span className="font-bold text-foreground">
                      {projectStats.velocity} pts
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

            {/* AI Agents Status */}
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

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="vg-card flex flex-col items-center gap-3 group hover:border-vg-primary/50 text-center py-6"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}
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

            {/* Features Section */}
            <section className="vg-card">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-vg-primary" />
                Tambo Features
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: "Generative Components",
                    desc: "TaskCard, PhaseCard, AgentStatus",
                  },
                  {
                    name: "Interactable Components",
                    desc: "AIConsultant, SpecViewer",
                  },
                  {
                    name: "Tools",
                    desc: "getProjectStats, getTasks, createTask",
                  },
                  {
                    name: "Context Helpers",
                    desc: "current_time, active_sprint",
                  },
                  {
                    name: "MCP Integration",
                    desc: "Supabase MCP server ready",
                  },
                  {
                    name: "Conversation Storage",
                    desc: "Built-in thread history",
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-vg-success mt-0.5 flex-shrink-0" />
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
