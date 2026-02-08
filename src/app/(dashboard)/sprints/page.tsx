"use client";

import { useState } from "react";

import { Button } from "@/components/atomic/button/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/atomic/feedback/Progress";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import {
  CalendarDays,
  Plus,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";

// Mock sprint data - would come from getSprints service
const mockSprints = [
  {
    id: "sprint-1",
    name: "Sprint 1",
    status: "active" as const,
    startDate: "Feb 1, 2026",
    endDate: "Feb 14, 2026",
    totalPoints: 24,
    completedPoints: 10,
    tasks: { total: 12, done: 5, inProgress: 4, todo: 3 },
    velocity: 42,
    teamActive: 4,
    blockers: 1,
  },
  {
    id: "sprint-0",
    name: "Sprint 0 - Discovery",
    status: "completed" as const,
    startDate: "Jan 15, 2026",
    endDate: "Jan 31, 2026",
    totalPoints: 18,
    completedPoints: 18,
    tasks: { total: 8, done: 8, inProgress: 0, todo: 0 },
    velocity: 36,
    teamActive: 3,
    blockers: 0,
  },
];

// Current sprint phase steps
const phaseSteps = [
  { name: "Planning", status: "done" as const },
  { name: "Development", status: "in-progress" as const },
  { name: "Testing", status: "pending" as const },
  { name: "Review", status: "pending" as const },
  { name: "Deploy", status: "pending" as const },
];

export default function SprintsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const activeSprint = mockSprints.find((s) => s.status === "active");

  return (
    <>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-vg-primary" />
                Sprint Planning
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage sprints and track velocity
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Sprint
            </Button>
          </div>

          {/* Active Sprint Overview */}
          {activeSprint && (
            <section className="vg-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success">ACTIVE SPRINT</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activeSprint.startDate} - {activeSprint.endDate}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {activeSprint.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phase 2: Development in progress
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-vg-primary">
                    {Math.round(
                      (activeSprint.completedPoints /
                        activeSprint.totalPoints) *
                        100
                    )}
                    %
                  </span>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center gap-2 my-6">
                {phaseSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        step.status === "done"
                          ? "bg-vg-primary border-vg-primary"
                          : step.status === "in-progress"
                          ? "border-vg-primary bg-transparent"
                          : "border-muted-foreground bg-transparent"
                      }`}
                    >
                      {step.status === "done" && (
                        <span className="text-[8px] text-primary-foreground">
                          ✓
                        </span>
                      )}
                      {step.status === "in-progress" && (
                        <span className="w-2 h-2 rounded-full bg-vg-primary" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-center ${
                        step.status === "done"
                          ? "text-foreground"
                          : step.status === "in-progress"
                          ? "text-vg-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sprint Progress Bar */}
              <Progress
                value={
                  (activeSprint.completedPoints / activeSprint.totalPoints) *
                  100
                }
                variant="rainbow"
                size="md"
              />

              {/* Metrics Row */}
              <div className="flex items-center gap-6 pt-6 mt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-vg-primary/20 flex items-center justify-center text-vg-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Velocity
                    </span>
                    <p className="text-lg font-bold text-foreground">
                      {activeSprint.velocity} pts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-vg-success/20 flex items-center justify-center text-vg-success">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Team
                    </span>
                    <p className="text-lg font-bold text-foreground">
                      {activeSprint.teamActive} Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-vg-danger/20 flex items-center justify-center text-vg-danger">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Blockers
                    </span>
                    <p className="text-lg font-bold text-foreground">
                      {activeSprint.blockers} Critical
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Task Distribution */}
          {activeSprint && (
            <section className="grid grid-cols-4 gap-4">
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {activeSprint.tasks.total}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-success/20 flex items-center justify-center text-vg-success">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {activeSprint.tasks.done}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-warning/20 flex items-center justify-center text-vg-warning">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {activeSprint.tasks.inProgress}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
              <div className="vg-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-vg-purple/20 flex items-center justify-center text-vg-purple">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {activeSprint.tasks.todo}
                  </p>
                  <p className="text-xs text-muted-foreground">To Do</p>
                </div>
              </div>
            </section>
          )}

          {/* Sprint History */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Sprint History
            </h2>
            <div className="space-y-3">
              {mockSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="vg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        sprint.status === "active" ? "success" : "default"
                      }
                    >
                      {sprint.status.toUpperCase()}
                    </Badge>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {sprint.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {sprint.startDate} - {sprint.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {sprint.completedPoints}/{sprint.totalPoints} pts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed
                      </p>
                    </div>
                    <div className="w-24">
                      <Progress
                        value={
                          (sprint.completedPoints / sprint.totalPoints) * 100
                        }
                        variant={
                          sprint.status === "completed" ? "success" : "default"
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Sprint</h2>
          <form className="space-y-4">
          <Input
            label="Sprint Name"
            placeholder="e.g., Sprint 2"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" required />
            <Input label="End Date" type="date" required />
          </div>
          <Input
            label="Velocity Target"
            type="number"
            placeholder="e.g., 40"
          />
          <TextArea
            label="Sprint Goals"
            placeholder="What are the main goals for this sprint?"
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Create Sprint
            </Button>
          </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
