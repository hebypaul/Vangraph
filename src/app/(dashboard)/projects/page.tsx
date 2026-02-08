"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/atomic/button/Button";
import { SearchInput } from "@/components/atomic/input/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/atomic/feedback/Progress";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";

import { getUserWorkspaces } from "@/actions/workspace";
import { getProjectsWithStats, createProject, type ProjectWithStats } from "@/actions/projects";

// Simple time ago helper
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const workspaces = await getUserWorkspaces();
        if (workspaces.length > 0) {
          const wsId = workspaces[0].id;
          setWorkspaceId(wsId);
          const data = await getProjectsWithStats(wsId);
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;

    try {
      setCreating(true);
      await createProject({
        workspace_id: workspaceId,
        name: formData.name,
        key: formData.key.toUpperCase(),
        description: formData.description,
        tech_stack: [],
        settings: {},
      });

      // Simple alert for now as we don't have a toast library installed
      // alert("Project created successfully"); 
      setIsCreateModalOpen(false);
      setFormData({ name: "", key: "", description: "" });
      
      // Refresh list
      const data = await getProjectsWithStats(workspaceId);
      setProjects(data);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-vg-primary" />
                Projects
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track your projects
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={loading || !workspaceId}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <SearchInput
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="vg-card h-48 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-vg-surface/50 rounded-xl border border-dashed border-border">
              <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Get started by creating your first project"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const completionRate = project.stats.completion_rate;
                return (
                  <Link
                    key={project.id}
                    href={`/board?project=${project.key}`}
                    className="vg-card group flex flex-col gap-4 hover:border-vg-primary/50 transition-colors"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="primary">{project.key}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-vg-primary transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-vg-primary transition-colors" />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {project.description || "No description provided"}
                    </p>

                    {/* Tech Stack - Placeholder if empty */}
                    <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                      {project.tech_stack?.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 bg-vg-surface rounded-full text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">
                          {completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={completionRate}
                        variant={completionRate >= 80 ? "success" : "default"}
                        size="sm"
                      />
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {project.stats.completed_issues}/{project.stats.total_issues}
                        </span>
                        {/* Team size fallback since we don't have it in stats yet */}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          -
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {timeAgo(project.updated_at)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Project</h2>
          <form className="space-y-4" onSubmit={handleCreateProject}>
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Project Key"
              placeholder="e.g., VAN"
              maxLength={4}
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              required
              hint="Unique 2-4 letter identifier for tasks (e.g., PROJ-123)"
            />
            <TextArea
              label="Description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
