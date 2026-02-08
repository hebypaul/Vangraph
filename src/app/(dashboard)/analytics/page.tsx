"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/atomic/feedback/Progress";
import { Dropdown, DropdownItem } from "@/components/atomic/overlay/Dropdown";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock analytics data
const weeklyStats = {
  tasksCompleted: 42,
  tasksCompletedChange: 12,
  velocity: 38,
  velocityChange: -5,
  teamEfficiency: 87,
  teamEfficiencyChange: 3,
  sprintProgress: 65,
};

const tasksByStatus = [
  { status: "Completed", count: 42, color: "bg-vg-success" },
  { status: "In Progress", count: 18, color: "bg-vg-warning" },
  { status: "Backlog", count: 24, color: "bg-muted-foreground" },
  { status: "Blocked", count: 3, color: "bg-vg-danger" },
];

const weeklyProgress = [
  { day: "Mon", tasks: 8, points: 12 },
  { day: "Tue", tasks: 6, points: 8 },
  { day: "Wed", tasks: 10, points: 14 },
  { day: "Thu", tasks: 7, points: 10 },
  { day: "Fri", tasks: 11, points: 16 },
];

const teamPerformance = [
  { name: "John D.", completed: 12, avatar: "JD" },
  { name: "Alice R.", completed: 10, avatar: "AR" },
  { name: "Bob S.", completed: 8, avatar: "BS" },
  { name: "Carol M.", completed: 6, avatar: "CM" },
];



export default function AnalyticsPage() {
  const maxTasks = Math.max(...weeklyProgress.map((d) => d.tasks));

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-vg-primary" />
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Project insights and performance metrics
            </p>
          </div>
          <Dropdown
            trigger={
              <button className="vg-btn vg-btn-outline">
                <Calendar className="w-4 h-4" />
                This Week
              </button>
            }
          >
            <DropdownItem onClick={() => {}}>Today</DropdownItem>
            <DropdownItem onClick={() => {}}>This Week</DropdownItem>
            <DropdownItem onClick={() => {}}>This Month</DropdownItem>
            <DropdownItem onClick={() => {}}>This Quarter</DropdownItem>
          </Dropdown>
        </div>

        {/* Key Metrics */}
        <section className="grid grid-cols-4 gap-4">
          <div className="vg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Tasks Completed</span>
              <CheckCircle2 className="w-4 h-4 text-vg-success" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {weeklyStats.tasksCompleted}
              </span>
              <span
                className={`text-xs flex items-center gap-0.5 ${
                  weeklyStats.tasksCompletedChange >= 0
                    ? "text-vg-success"
                    : "text-vg-danger"
                }`}
              >
                {weeklyStats.tasksCompletedChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(weeklyStats.tasksCompletedChange)}%
              </span>
            </div>
          </div>

          <div className="vg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Velocity</span>
              <Zap className="w-4 h-4 text-vg-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {weeklyStats.velocity}
              </span>
              <span className="text-xs text-muted-foreground">pts</span>
              <span
                className={`text-xs flex items-center gap-0.5 ${
                  weeklyStats.velocityChange >= 0
                    ? "text-vg-success"
                    : "text-vg-danger"
                }`}
              >
                {weeklyStats.velocityChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(weeklyStats.velocityChange)}%
              </span>
            </div>
          </div>

          <div className="vg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Team Efficiency</span>
              <Users className="w-4 h-4 text-vg-purple" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {weeklyStats.teamEfficiency}%
              </span>
              <span
                className={`text-xs flex items-center gap-0.5 ${
                  weeklyStats.teamEfficiencyChange >= 0
                    ? "text-vg-success"
                    : "text-vg-danger"
                }`}
              >
                {weeklyStats.teamEfficiencyChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(weeklyStats.teamEfficiencyChange)}%
              </span>
            </div>
          </div>

          <div className="vg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Sprint Progress</span>
              <Clock className="w-4 h-4 text-vg-warning" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-foreground">
                {weeklyStats.sprintProgress}%
              </span>
            </div>
            <Progress value={weeklyStats.sprintProgress} variant="rainbow" size="sm" />
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          {/* Weekly Progress Chart */}
          <section className="col-span-2 vg-card">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Weekly Progress
            </h2>
            <div className="flex items-end gap-3 h-40">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-vg-primary to-vg-purple rounded-t transition-all"
                      style={{ height: `${(day.tasks / maxTasks) * 100}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <span className="text-xs font-bold text-foreground">
                    {day.tasks}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Tasks by Status */}
          <section className="vg-card">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Tasks by Status
            </h2>
            <div className="space-y-3">
              {tasksByStatus.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.status}</span>
                    <span className="font-bold text-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 bg-vg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{
                        width: `${(item.count / 87) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Team Performance */}
          <section className="vg-card">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-vg-primary" />
              Team Performance
            </h2>
            <div className="space-y-3">
              {teamPerformance.map((member, idx) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-vg-surface transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-4">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vg-primary to-vg-purple flex items-center justify-center text-white text-xs font-bold">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.completed} tasks completed
                    </p>
                  </div>
                  <Badge variant="success">{member.completed}</Badge>
                </div>
              ))}
            </div>
          </section>

          {/* AI Insights */}

        </div>
      </div>
    </main>
  );
}
