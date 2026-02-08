"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Calendar, 
  Target, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

import { Button } from "@/components/atomic/button/Button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Progress } from "@/components/atomic/feedback/Progress";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { Select } from "@/components/atomic/input/Select";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";

import { getUserWorkspaces } from "@/actions/workspace";
import { getProjects } from "@/actions/projects";
import { getSprints, getActiveSprint, createSprint, getSprintProgress } from "@/actions/sprints";
import type { Project, Sprint, SprintProgress } from "@/types";

// Helper for date formatting
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function SprintsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [sprintProgress, setSprintProgress] = useState<SprintProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    goal: "",
  });

  // Initial Data Load
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const workspaces = await getUserWorkspaces();
        if (workspaces.length > 0) {
          const workspaceId = workspaces[0].id;
          const projectData = await getProjects(workspaceId);
          setProjects(projectData);
          if (projectData.length > 0) {
            setSelectedProjectId(projectData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Load Sprints when project changes
  useEffect(() => {
    async function loadSprints() {
      if (!selectedProjectId) return;
      
      try {
        setLoading(true);
        const [sprintsData, activeData] = await Promise.all([
          getSprints(selectedProjectId),
          getActiveSprint(selectedProjectId)
        ]);
        
        setSprints(sprintsData);
        setActiveSprint(activeData);
        
        if (activeData) {
          const progress = await getSprintProgress(activeData.id);
          setSprintProgress(progress);
        } else {
          setSprintProgress(null);
        }
      } catch (error) {
        console.error("Failed to load sprints:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSprints();
  }, [selectedProjectId]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      setCreating(true);
      await createSprint({
        project_id: selectedProjectId,
        name: formData.name,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        goal: formData.goal,
        status: "planned",
      });

      setIsCreateModalOpen(false);
      setFormData({ name: "", startDate: "", endDate: "", goal: "" });
      
      // Refresh sprints
      const sprintsData = await getSprints(selectedProjectId);
      setSprints(sprintsData);
    } catch (error) {
      console.error("Failed to create sprint:", error);
      alert("Failed to create sprint. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Prepare chart data
  const chartData = sprintProgress?.burndown?.map((point, i) => ({
    name: formatDate(point.date),
    actual: point.remaining,
    ideal: sprintProgress.ideal_burndown?.[i]?.remaining || 0,
  })) || [];

  return (
    <>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-6 h-6 text-vg-primary" />
                Sprints
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage sprint cycles and track velocity
              </p>
            </div>
            <div className="flex items-center gap-3">
              {projects.length > 0 && (
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                  className="w-[200px]"
                />
              )}
              <Button onClick={() => setIsCreateModalOpen(true)} disabled={!selectedProjectId}>
                <Plus className="w-4 h-4" />
                Start Sprint
              </Button>
            </div>
          </div>

          {loading && !activeSprint ? (
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !activeSprint ? (
            <div className="text-center py-12 bg-vg-surface/50 rounded-xl border border-dashed border-border">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No active sprint</h3>
              <p className="text-muted-foreground mb-4">
                {selectedProjectId ? "Start a new sprint for this project" : "Select a project to view sprints"}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} disabled={!selectedProjectId}>
                <Plus className="w-4 h-4 mr-2" />
                Create Sprint
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Sprint Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="vg-card bg-linear-to-br from-vg-primary/5 to-transparent border-vg-primary/20">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-foreground">
                          {activeSprint.name}
                        </h2>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(activeSprint.start_date || "")} - {formatDate(activeSprint.end_date || "")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {Math.max(0, Math.ceil((new Date(activeSprint.end_date || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Complete Sprint
                    </Button>
                  </div>

                  {sprintProgress && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-background/50 rounded-lg p-3 border border-border">
                        <span className="text-xs text-muted-foreground block mb-1">To Do</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {sprintProgress.remaining_points}
                          </span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border">
                        <span className="text-xs text-muted-foreground block mb-1">In Progress</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {/* Assuming 'in progress' logic or separate state */}
                            -
                          </span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border">
                        <span className="text-xs text-muted-foreground block mb-1">Done</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-vg-primary">
                            {sprintProgress.completed_points}
                          </span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sprint Progress</span>
                      <span className="font-bold text-foreground">
                        {sprintProgress && sprintProgress.total_points > 0 
                          ? Math.round((sprintProgress.completed_points / sprintProgress.total_points) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <Progress value={sprintProgress && sprintProgress.total_points > 0 
                      ? (sprintProgress.completed_points / sprintProgress.total_points) * 100 
                      : 0} />
                  </div>
                </div>

                {/* Burndown Chart */}
                <div className="vg-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground">Burndown Chart</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-vg-primary" />
                        <span className="text-muted-foreground">Actual</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        <span className="text-muted-foreground">Ideal</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="var(--muted-foreground)" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="var(--muted-foreground)" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}pt`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '0.5rem',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="ideal"
                            stroke="var(--muted-foreground)"
                            strokeDasharray="5 5"
                            fill="transparent"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="var(--primary)"
                            fill="url(#colorActual)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Not enough data to display chart
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Sprint Goal */}
                <StatsCard
                  title="Sprint Goal"
                  icon={<Target className="w-4 h-4 text-vg-primary" />}
                >
                  <p className="text-sm text-foreground mb-4">
                    {activeSprint.goal || "No goal set for this sprint."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-vg-surface p-2 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    <span>Focus on stability and core features</span>
                  </div>
                </StatsCard>

                {/* Team Velocity ? */}
                {/* Risks */}
                <div className="vg-card bg-amber-500/5 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3 text-amber-500">
                    <AlertCircle className="w-4 h-4" />
                    <h3 className="font-bold text-sm">Sprint Risks</h3>
                  </div>
                  <ul className="space-y-2">
                    <li className="text-xs text-muted-foreground flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      Backend API delay might block frontend tasks
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Past Sprints List */}
          {sprints.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Sprint History</h2>
              <div className="grid gap-4">
                {sprints.map((sprint) => (
                  <div 
                    key={sprint.id}
                    className={`vg-card flex items-center justify-between p-4 ${sprint.id === activeSprint?.id ? 'border-vg-primary/50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        sprint.status === 'active' 
                          ? 'bg-vg-primary/10 text-vg-primary' 
                          : sprint.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-vg-surface text-muted-foreground'
                      }`}>
                        {sprint.status === 'active' ? <TrendingUp className="w-4 h-4" /> : 
                         sprint.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{sprint.name}</h3>
                          {sprint.id === activeSprint?.id && <Badge variant="primary" size="sm">Current</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(sprint.start_date || "")} - {formatDate(sprint.end_date || "")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {/* Placeholder for velocity/completion */}
                          -
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Sprint</h2>
          <form className="space-y-4" onSubmit={handleCreateSprint}>
            <Input
              label="Sprint Name"
              placeholder="e.g., Sprint 12"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <Input
              label="Sprint Goal"
              placeholder="What do you want to achieve?"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sprint"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
