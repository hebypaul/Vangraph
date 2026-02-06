"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/atomic/button/Button";
import { SearchInput } from "@/components/atomic/input/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/atomic/feedback/Progress";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";

// Mock projects data - would come from getProjects service
const mockProjects = [
  {
    id: "proj-1",
    name: "Vangraph",
    key: "VAN",
    description: "AI-powered project management platform",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tambo"],
    totalTasks: 24,
    completedTasks: 8,
    teamSize: 4,
    lastUpdated: "2 hours ago",
  },
  {
    id: "proj-2",
    name: "Mobile App",
    key: "MOB",
    description: "Cross-platform mobile application",
    techStack: ["React Native", "Expo", "Firebase"],
    totalTasks: 18,
    completedTasks: 12,
    teamSize: 3,
    lastUpdated: "1 day ago",
  },
  {
    id: "proj-3",
    name: "API Gateway",
    key: "API",
    description: "Microservices API gateway and orchestration",
    techStack: ["Go", "gRPC", "Kubernetes"],
    totalTasks: 32,
    completedTasks: 28,
    teamSize: 5,
    lastUpdated: "3 hours ago",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const completionRate = Math.round(
                  (project.completedTasks / project.totalTasks) * 100
                );
                return (
                  <Link
                    key={project.id}
                    href={`/board?project=${project.key}`}
                    className="vg-card group flex flex-col gap-4 hover:border-vg-primary/50"
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 bg-vg-surface rounded-full text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 bg-vg-surface rounded-full text-muted-foreground">
                          +{project.techStack.length - 3}
                        </span>
                      )}
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
                          {project.completedTasks}/{project.totalTasks} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.teamSize}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.lastUpdated}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Project</h2>
          <form className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            required
          />
          <Input
            label="Project Key"
            placeholder="e.g., VAN"
            maxLength={4}
            required
          />
          <TextArea
            label="Description"
            placeholder="Describe your project..."
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
              Create Project
            </Button>
          </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
