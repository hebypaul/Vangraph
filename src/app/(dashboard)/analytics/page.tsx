"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { Button } from "@/components/atomic/button/Button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Select } from "@/components/atomic/input/Select";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";
import { getUserWorkspaces } from "@/actions/workspace";
import { getProjects } from "@/actions/projects";
import { getProjectAnalytics, type AnalyticsData } from "@/actions/analytics";
import type { Project } from "@/types";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Projects
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

  // Load Analytics Data
  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedProjectId) return;
      try {
        setLoading(true);
        const data = await getProjectAnalytics(selectedProjectId);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedProjectId]);

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-vg-primary" />
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Project insights and performance metrics
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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rouded-xl" />
            ))}
          </div>
        ) : !analyticsData ? (
          <div className="text-center py-12 bg-vg-surface/50 rounded-xl border border-dashed border-border">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No data available</h3>
            <p className="text-muted-foreground">
              Select an active project to view analytics
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Issues"
                icon={<Target className="w-4 h-4 text-vg-primary" />}
                trend={{ value: 12, isPositive: true }}
              >
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.total_issues}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active in current project
                </p>
              </StatsCard>
              
              <StatsCard
                title="Completion Rate"
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                trend={{ value: 5, isPositive: true }}
              >
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.total_issues > 0 
                    ? Math.round((analyticsData.completed_total / analyticsData.total_issues) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.completed_total} issues completed
                </p>
              </StatsCard>

              <StatsCard
                title="Velocity"
                icon={<Activity className="w-4 h-4 text-blue-500" />}
              >
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.velocity_history.length > 0 
                    ? Math.round(analyticsData.velocity_history.reduce((a, b) => a + b.points, 0) / analyticsData.velocity_history.length) 
                    : 0}
                  <span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average per sprint
                </p>
              </StatsCard>

              <StatsCard
                title="Active Sprint"
                icon={<Clock className="w-4 h-4 text-amber-500" />}
              >
                <div className="text-lg font-bold text-foreground truncate">
                  {analyticsData.active_sprint_name || "None"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current cycle
                </p>
              </StatsCard>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Velocity Chart */}
              <div className="vg-card col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Sprint Velocity</h3>
                    <p className="text-sm text-muted-foreground">Points completed over last 5 sprints</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  {analyticsData.velocity_history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.velocity_history}>
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
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '0.5rem',
                          }}
                          cursor={{ fill: 'var(--muted)/0.2' }}
                        />
                        <Bar 
                          dataKey="points" 
                          fill="var(--primary)" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No velocity data available yet
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Distribution */}
              <div className="vg-card">
                <h3 className="text-lg font-bold text-foreground mb-6">Issue Status Distribution</h3>
                <div className="h-[300px] w-full">
                  {analyticsData.issue_distribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.issue_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsData.issue_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No issues to display
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="vg-card">
                <h3 className="text-lg font-bold text-foreground mb-6">Activity (Last 14 Days)</h3>
                <div className="h-[300px] w-full">
                  {analyticsData.recent_activity.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.recent_activity}>
                        <defs>
                          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
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
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Area type="monotone" dataKey="created" stroke="#8884d8" fillOpacity={1} fill="url(#colorCreated)" />
                        <Area type="monotone" dataKey="completed" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCompleted)" />
                        <Legend verticalAlign="top" height={36} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
