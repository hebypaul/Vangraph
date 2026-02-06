"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
import { DroppableColumn, DraggableCard, IssueDetailModal } from "@/components/kanban";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";

// Import services
import {
  getIssuesByStatus,
  createIssue,
  updateIssuePosition,
  calculatePosition,
  subscribeToIssues,
} from "@/services/supabase/issues";
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

function BoardContent() {
  const router = useRouter();
  const [issues, setIssues] = useState<Record<IssueStatus, IssueWithKey[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeIssue, setActiveIssue] = useState<IssueWithKey | null>(null);

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [isCreating, setIsCreating] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadIssues = useCallback(async () => {
    try {
      const data = await getIssuesByStatus(DEFAULT_PROJECT_ID);
      setIssues(data);
    } catch (error) {
      console.error("Failed to load issues:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch issues on mount + realtime subscription
  useEffect(() => {
    loadIssues();
    
    // Subscribe to realtime updates
    const unsubscribe = subscribeToIssues(DEFAULT_PROJECT_ID, () => {
      loadIssues();
    });

    return () => {
      unsubscribe();
    };
  }, [loadIssues]);

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

  // Get all task IDs for a column
  const getColumnTaskIds = (columnId: IssueStatus): string[] => {
    return getFilteredTasks(columnId).map((t) => t.id);
  };

  // Find which column an issue is in
  const findColumnForIssue = (issueId: string): IssueStatus | null => {
    if (!issues) return null;
    for (const [status, statusIssues] of Object.entries(issues)) {
      if (statusIssues.some((i) => i.id === issueId)) {
        return status as IssueStatus;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issueId = active.id as string;
    
    // Find the issue being dragged
    if (issues) {
      for (const statusIssues of Object.values(issues)) {
        const found = statusIssues.find((i) => i.id === issueId);
        if (found) {
          setActiveIssue(found);
          break;
        }
      }
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over || !issues) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    const sourceColumn = findColumnForIssue(activeId);
    let targetColumn: IssueStatus | null = COLUMNS.find((c) => c.id === overId)?.id || null;
    
    // If dropped on another card, find its column
    if (!targetColumn) {
      targetColumn = findColumnForIssue(overId);
    }

    if (!sourceColumn || !targetColumn) return;

    // Get target column issues
    const targetIssues = [...(issues[targetColumn] || [])];
    
    // Find insertion index
    let insertIndex = targetIssues.length; // Default to end
    if (overId !== targetColumn) {
      const overIndex = targetIssues.findIndex((i) => i.id === overId);
      if (overIndex !== -1) {
        insertIndex = overIndex;
      }
    }

    // Calculate new position using fractional indexing
    const positionAbove = insertIndex > 0 ? (targetIssues[insertIndex - 1]?.position ?? (insertIndex - 1) * 1000) : null;
    const positionBelow = insertIndex < targetIssues.length ? (targetIssues[insertIndex]?.position ?? insertIndex * 1000) : null;
    const newPosition = calculatePosition(positionAbove, positionBelow);

    // Optimistic update
    const updatedIssues = { ...issues };
    
    // Remove from source
    updatedIssues[sourceColumn] = updatedIssues[sourceColumn].filter((i) => i.id !== activeId);
    
    // Find the issue being moved
    const movingIssue = issues[sourceColumn].find((i) => i.id === activeId);
    if (!movingIssue) return;

    // Add to target with new position
    const updatedIssue = { ...movingIssue, status: targetColumn, position: newPosition };
    updatedIssues[targetColumn] = [
      ...updatedIssues[targetColumn].slice(0, insertIndex),
      updatedIssue,
      ...updatedIssues[targetColumn].slice(insertIndex),
    ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    setIssues(updatedIssues);

    // Persist to Supabase
    try {
      await updateIssuePosition(activeId, targetColumn, newPosition);
    } catch (error) {
      console.error("Failed to update issue position:", error);
      // Revert on error
      await loadIssues();
    }
  };

  // Open issue detail modal
  const openIssueDetail = (issueId: string) => {
    router.push(`/board?ticketId=${issueId}`, { scroll: false });
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

          {/* Kanban Board with DnD */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map((column) => {
                const tasks = getFilteredTasks(column.id);
                const taskIds = getColumnTaskIds(column.id);

                return (
                  <DroppableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    count={tasks.length}
                    colorClass={columnColors[column.id]}
                    itemIds={taskIds}
                    isLoading={loading}
                    onAddClick={() => setIsCreateModalOpen(true)}
                  >
                    {loading ? (
                      <>
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </>
                    ) : tasks.length > 0 ? (
                      tasks.map((task) => (
                        <DraggableCard
                          key={task.id}
                          issue={task}
                          onClick={() => openIssueDetail(task.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks
                      </div>
                    )}
                  </DroppableColumn>
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeIssue ? (
                <div className="bg-card p-4 rounded-lg border border-primary shadow-2xl rotate-3 scale-105 opacity-90">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {activeIssue.key}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground mt-1">
                    {activeIssue.title}
                  </h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>

        {/* Bottom Chat Input */}
        <div className="p-4 border-t border-border">
          <ChatInput
            placeholder="Ask Vangraph to create tasks, refactor code, or analyze the sprint..."
            contextLabel={`Sprint 1 • ${totalTasks} tasks`}
          />
        </div>
      </div>

      {/* Issue Detail Modal (URL-state driven) */}
      <IssueDetailModal />

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

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-background items-center justify-center">Loading...</div>}>
      <BoardContent />
    </Suspense>
  );
}
