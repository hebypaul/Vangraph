"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AgentStatusCardBase } from "@/components/tambo/agent-status";
import { Button } from "@/components/atomic/button/Button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Code,
  TestTube,
  Shield,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// Mock agents data with extended info
const mockAgents = [
  {
    id: "agent-1",
    name: "Coder Agent",
    type: "coder" as const,
    status: "active" as const,
    description: "Handles code generation, refactoring, and implementation tasks",
    tasksCompleted: 24,
    currentTask: "Implementing authentication flow",
    uptime: "2h 34m",
    icon: Code,
  },
  {
    id: "agent-2",
    name: "QA Agent",
    type: "qa" as const,
    status: "idle" as const,
    description: "Performs automated testing and quality assurance checks",
    tasksCompleted: 18,
    currentTask: null,
    uptime: "5h 12m",
    icon: TestTube,
  },
  {
    id: "agent-3",
    name: "Architect Agent",
    type: "architect" as const,
    status: "reviewing" as const,
    description: "Reviews system design and architectural decisions",
    tasksCompleted: 12,
    currentTask: "Reviewing database schema migration",
    uptime: "3h 45m",
    icon: Shield,
  },
  {
    id: "agent-4",
    name: "Security Agent",
    type: "security" as const,
    status: "idle" as const,
    description: "Scans for vulnerabilities and security issues",
    tasksCompleted: 8,
    currentTask: null,
    uptime: "1h 20m",
    icon: Bot,
  },
];

// Mock activity log
const activityLog = [
  { id: 1, agent: "Coder Agent", action: "Completed task VA-089", time: "2 min ago", type: "success" },
  { id: 2, agent: "Architect Agent", action: "Started reviewing PR #42", time: "5 min ago", type: "info" },
  { id: 3, agent: "QA Agent", action: "Finished test suite run", time: "12 min ago", type: "success" },
  { id: 4, agent: "Security Agent", action: "No vulnerabilities found", time: "18 min ago", type: "success" },
  { id: 5, agent: "Coder Agent", action: "Started task VA-102", time: "25 min ago", type: "info" },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const activeCount = mockAgents.filter((a) => a.status === "active").length;
  const idleCount = mockAgents.filter((a) => a.status === "idle").length;
  const reviewingCount = mockAgents.filter((a) => a.status === "reviewing").length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col">
        <Header projectName="Vangraph" sprintName="Sprint 1" />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bot className="w-6 h-6 text-vg-primary" />
                  AI Agents
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage autonomous AI agents
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Pause className="w-4 h-4" />
                  Pause All
                </Button>
                <Button variant="primary" size="sm">
                  <Play className="w-4 h-4" />
                  Resume All
                </Button>
              </div>
            </div>

            {/* Status Summary */}
            <section className="grid grid-cols-4 gap-4">
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-primary/20 flex items-center justify-center text-vg-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{mockAgents.length}</p>
                  <p className="text-xs text-muted-foreground">Total Agents</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-success/20 flex items-center justify-center text-vg-success">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-warning/20 flex items-center justify-center text-vg-warning">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{reviewingCount}</p>
                  <p className="text-xs text-muted-foreground">Reviewing</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{idleCount}</p>
                  <p className="text-xs text-muted-foreground">Idle</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-3 gap-6">
              {/* Agents Grid */}
              <section className="col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-foreground">Agent Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  {mockAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`vg-card cursor-pointer transition-all ${
                        selectedAgent === agent.id
                          ? "border-vg-primary ring-1 ring-vg-primary/50"
                          : ""
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              agent.status === "active"
                                ? "bg-vg-success/20 text-vg-success"
                                : agent.status === "reviewing"
                                ? "bg-vg-warning/20 text-vg-warning"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <agent.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {agent.name}
                            </h3>
                            <Badge
                              variant={
                                agent.status === "active"
                                  ? "success"
                                  : agent.status === "reviewing"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {agent.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {agent.description}
                      </p>
                      {agent.currentTask && (
                        <div className="text-xs bg-vg-surface rounded-lg p-2 mb-3">
                          <span className="text-muted-foreground">Current: </span>
                          <span className="text-foreground">{agent.currentTask}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {agent.tasksCompleted} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {agent.uptime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Activity Log */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
                <div className="vg-card space-y-3">
                  {activityLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.type === "success"
                            ? "bg-vg-success/20 text-vg-success"
                            : "bg-vg-primary/20 text-vg-primary"
                        }`}
                      >
                        {entry.type === "success" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{entry.agent}</span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.action}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {entry.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
