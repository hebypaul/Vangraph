"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TaskCardBase } from "@/components/tambo/task-card";
import { AgentStatusCardBase } from "@/components/tambo/agent-status";
import { ChatInput } from "@/components/layout/chat-input";
import { Button } from "@/components/atomic/button/Button";
import { SearchInput } from "@/components/atomic/input/SearchInput";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/atomic/overlay/Dropdown";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";

// Mock data for the board - would come from getIssuesByStatus service
const initialColumns = [
  {
    id: "backlog",
    title: "BACKLOG",
    tasks: [
      {
        id: "VA-102",
        title: "Research competitors for QA flow",
        description: "Analyze competitor testing workflows and automation strategies",
        status: "backlog" as const,
        priority: "medium" as const,
        assignees: ["QA"],
        comments: 2,
      },
      {
        id: "VA-105",
        title: "Update dependency list for modules",
        description: "Review and update all module dependencies",
        status: "backlog" as const,
        priority: "low" as const,
        assignees: ["AR"],
        comments: 1,
      },
      {
        id: "VA-108",
        title: "Design notification system",
        description: "Create notification architecture for real-time updates",
        status: "backlog" as const,
        priority: "high" as const,
        assignees: ["JD"],
        comments: 0,
      },
    ],
  },
  {
    id: "in-progress",
    title: "IN PROGRESS",
    tasks: [
      {
        id: "VA-089",
        title: "Implement Auth Flow",
        description: "Complete the backend integration with JWT authentication and set up the session management",
        status: "in-progress" as const,
        priority: "high" as const,
        assignees: ["JD", "AR"],
        comments: 5,
      },
      {
        id: "VA-091",
        title: "Build dashboard components",
        description: "Create reusable dashboard widgets",
        status: "in-progress" as const,
        priority: "medium" as const,
        assignees: ["BS"],
        comments: 3,
      },
    ],
  },
  {
    id: "review",
    title: "REVIEW",
    tasks: [
      {
        id: "VA-099",
        title: "Database Schema Migration",
        description: "Migrate database schema to support new user roles",
        status: "review" as const,
        priority: "high" as const,
        assignees: ["AR"],
        comments: 3,
      },
    ],
  },
  {
    id: "done",
    title: "DONE",
    tasks: [
      {
        id: "VA-085",
        title: "Setup project structure",
        description: "Initialize Next.js project with Tambo integration",
        status: "done" as const,
        priority: "high" as const,
        assignees: ["JD"],
        comments: 2,
      },
      {
        id: "VA-086",
        title: "Configure Supabase",
        description: "Set up Supabase project and database tables",
        status: "done" as const,
        priority: "medium" as const,
        assignees: ["AR"],
        comments: 1,
      },
    ],
  },
];

const agents = [
  { name: "Coder Agent", type: "coder" as const, status: "active" as const },
  { name: "QA Agent", type: "qa" as const, status: "idle" as const },
  { name: "Architect Agent", type: "architect" as const, status: "reviewing" as const },
];

const columnColors: Record<string, string> = {
  backlog: "bg-muted-foreground",
  "in-progress": "bg-vg-primary",
  review: "bg-vg-warning",
  done: "bg-vg-success",
};

export default function BoardPage() {
  const [columns] = useState(initialColumns);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter tasks based on search
  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col">
        <Header projectName="Vangraph" sprintName="Sprint 1" />

        <main className="flex-1 p-6 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <SearchInput
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dropdown
                trigger={
                  <button className="vg-btn vg-btn-outline text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                }
              >
                <DropdownItem onClick={() => {}}>All Tasks</DropdownItem>
                <DropdownItem onClick={() => {}}>High Priority</DropdownItem>
                <DropdownItem onClick={() => {}}>My Tasks</DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => {}}>Clear Filters</DropdownItem>
              </Dropdown>
              <Badge variant="default">{totalTasks} tasks</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-vg-primary/20 text-vg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-vg-primary/20 text-vg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Agent Status Row */}
          <div className="flex gap-4 mb-6">
            {agents.map((agent) => (
              <AgentStatusCardBase
                key={agent.name}
                name={agent.name}
                type={agent.type}
                status={agent.status}
              />
            ))}
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {filteredColumns.map((column) => (
              <div key={column.id} className="vg-column min-w-[300px]">
                {/* Column Header */}
                <div className="vg-column-header">
                  <span
                    className={`w-2 h-2 rounded-full ${columnColors[column.id]}`}
                  />
                  {column.title}
                  <span className="ml-auto bg-vg-surface px-2 py-0.5 rounded-full text-xs">
                    {column.tasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-3">
                  {column.tasks.map((task) => (
                    <TaskCardBase
                      key={task.id}
                      task={task}
                      showDescription={true}
                    />
                  ))}
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>

                {/* Add Task Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full mt-3 p-2 border border-dashed border-border rounded-lg text-muted-foreground text-sm hover:border-vg-primary hover:text-vg-primary transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add task
                </button>
              </div>
            ))}
          </div>
        </main>

        {/* Bottom Chat Input */}
        <div className="p-4 border-t border-border">
          <ChatInput
            placeholder="Ask Vangraph to create tasks, refactor code, or analyze the sprint..."
            contextLabel="Sprint 1 • 12 active tasks"
          />
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Task</h2>
          <form className="space-y-4">
          <Input
            label="Task Title"
            placeholder="Enter task title"
            required
          />
          <TextArea
            label="Description"
            placeholder="Describe the task..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Priority
              </label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Status
              </label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm">
                <option value="backlog">Backlog</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>
          <Input
            label="Assignees"
            placeholder="Enter initials (e.g., JD, AR)"
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
              Create Task
            </Button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}
