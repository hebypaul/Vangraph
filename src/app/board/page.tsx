"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/atomic/feedback/Skeleton";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";

// Import services
import { getIssuesByStatus, createIssue } from "@/services/supabase/issues";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import type { IssueWithKey, IssueStatus, Priority } from "@/types";

// Column configuration
const COLUMNS: { id: IssueStatus; title: string }[] = [
  { id: "backlog", title: "BACKLOG" },
  { id: "todo", title: "TODO" },
  { id: "in_progress", title: "IN PROGRESS" },
  { id: "in_review", title: "REVIEW" },
  { id: "done", title: "DONE" },
];

const columnColors: Record<string, string> = {
  backlog: "bg-muted-foreground",
  todo: "bg-slate-400",
  in_progress: "bg-vg-primary",
  in_review: "bg-vg-warning",
  done: "bg-vg-success",
  cancelled: "bg-vg-danger",
};

// Mock agents data
const agents = [
  { name: "Coder Agent", type: "coder" as const, status: "active" as const },
  { name: "QA Agent", type: "qa" as const, status: "idle" as const },
  { name: "Architect Agent", type: "architect" as const, status: "reviewing" as const },
];

export default function BoardPage() {
  const [issues, setIssues] = useState<Record<IssueStatus, IssueWithKey[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch issues on mount
  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await getIssuesByStatus(DEFAULT_PROJECT_ID);
      setIssues(data);
    } catch (error) {
      console.error("Failed to load issues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    setIsCreating(true);
    try {
      await createIssue({
        project_id: DEFAULT_PROJECT_ID,
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        status: "backlog",
      });
      
      // Refresh issues
      await loadIssues();
      
      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter issues by search
  const getFilteredTasks = (columnId: IssueStatus): IssueWithKey[] => {
    if (!issues) return [];
    const columnTasks = issues[columnId] || [];
    if (!searchQuery) return columnTasks;
    
    return columnTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const totalTasks = issues 
    ? Object.values(issues).reduce((acc, tasks) => acc + tasks.length, 0) 
    : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-(--sidebar-width) flex flex-col">
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
              <Badge variant="default">
                {loading ? "..." : `${totalTasks} tasks`}
              </Badge>
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
            {COLUMNS.map((column) => {
              const tasks = getFilteredTasks(column.id);
              
              return (
                <div key={column.id} className="vg-column min-w-[300px]">
                  {/* Column Header */}
                  <div className="vg-column-header">
                    <span
                      className={`w-2 h-2 rounded-full ${columnColors[column.id]}`}
                    />
                    {column.title}
                    <span className="ml-auto bg-vg-surface px-2 py-0.5 rounded-full text-xs">
                      {loading ? "..." : tasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="flex flex-col gap-3">
                    {loading ? (
                      // Loading skeletons
                      <>
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </>
                    ) : (
                      tasks.map((task) => (
                        <TaskCardBase
                          key={task.id}
                          task={{
                            id: task.key,
                            title: task.title,
                            description: task.description,
                            status: task.status as "backlog" | "in-progress" | "review" | "done",
                            priority: task.priority as "low" | "medium" | "high" | "critical",
                            assignees: task.assignee ? [task.assignee.full_name || task.assignee.email] : [],
                            comments: 0,
                          }}
                          showDescription={true}
                        />
                      ))
                    )}
                    {!loading && tasks.length === 0 && (
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
              );
            })}
          </div>
        </main>

        {/* Bottom Chat Input */}
        <div className="p-4 border-t border-border">
          <ChatInput
            placeholder="Ask Vangraph to create tasks, refactor code, or analyze the sprint..."
            contextLabel={`Sprint 1 • ${totalTasks} tasks`}
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
          <form className="space-y-4" onSubmit={handleCreateTask}>
            <Input
              label="Task Title"
              placeholder="Enter task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <TextArea
              label="Description"
              placeholder="Describe the task..."
              rows={3}
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Priority
                </label>
                <select 
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Status
                </label>
                <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm">
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
                isLoading={isCreating}
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
