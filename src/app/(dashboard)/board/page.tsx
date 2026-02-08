"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

import { Button } from "@/components/atomic/button/Button";
import { Modal, ModalHeader, ModalBody } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Select } from "@/components/atomic/input/Select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";
import { DroppableColumn, DraggableCard, IssueDetailModal } from "@/components/kanban";
import {
  Plus,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Filter,
  List,
  Search,
} from "lucide-react";

// Import services
import {
  getIssuesByStatus,
  createIssue,
  updateIssuePosition,
  calculatePosition,
  subscribeToIssues,
} from "@/services/supabase/issues";

import { ChatInput } from "@/components/layout/chat-input";
import { SearchInput } from "@/components/atomic/input/SearchInput";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/atomic/overlay/Dropdown";
import { getUserWorkspaces } from "@/actions/workspace";
import { getProjects } from "@/actions/projects";
import type { IssueWithKey, IssueStatus, Priority, Project } from "@/types";

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

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectIdParam);
  const [issues, setIssues] = useState<Record<IssueStatus, IssueWithKey[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeIssue, setActiveIssue] = useState<IssueWithKey | null>(null);

  // Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const workspaces = await getUserWorkspaces();
        if (workspaces.length > 0) {
          const workspaceId = workspaces[0].id;
          const projectsData = await getProjects(workspaceId);
          setProjects(projectsData);
          
          if (projectsData.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projectsData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [selectedProjectId]);

  // Load issues when project changes
  const loadIssues = useCallback(async () => {
    if (!selectedProjectId) {
      setIssues(null);
      // If we have projects but just haven't loaded them yet, don't stop loading
      // But here allow UI to show "Select Project"
      return; 
    }

    setLoading(true);
    try {
      const data = await getIssuesByStatus(selectedProjectId);
      setIssues(data);
    } catch (error) {
      console.error("Failed to load issues:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
        loadIssues(); // Initial load
        
        const unsubscribe = subscribeToIssues(selectedProjectId, () => {
             loadIssues();
        });
        return () => {
        unsubscribe();
        };
    } else {
        // If no project selected, stop loading so we can show empty state
        if (projects.length === 0) {
            // keep loading until projects fetch finishes
        }
    }
  }, [selectedProjectId, loadIssues]); // Check dependency issues

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

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await createIssue({
        project_id: selectedProjectId,
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        status: "backlog",
      });

      await loadIssues();

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

  // Drag handlers
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over || !selectedProjectId || !issues) return;

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

    // Get target column issues (excluding the dragged item to compute correct neighbors)
    const targetIssuesWithoutActive = (issues[targetColumn] || []).filter(i => i.id !== activeId);
    
    // Find insertion index in the filtered list
    let insertIndex = targetIssuesWithoutActive.length; // Default to end
    if (overId !== targetColumn) {
      const overIndex = targetIssuesWithoutActive.findIndex((i) => i.id === overId);
      if (overIndex !== -1) {
        insertIndex = overIndex;
      }
    }

    // Calculate new position using fractional indexing
    const positionAbove = insertIndex > 0 ? (targetIssuesWithoutActive[insertIndex - 1]?.position ?? (insertIndex - 1) * 1000) : null;
    const positionBelow = insertIndex < targetIssuesWithoutActive.length ? (targetIssuesWithoutActive[insertIndex]?.position ?? insertIndex * 1000) : null;
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
    if (selectedProjectId) {
      router.push(`/board?project=${selectedProjectId}&ticketId=${issueId}`, { scroll: false });
    }
  };


  if (loading && (!projects.length || (selectedProjectId && !issues))) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
             {[1, 2, 3, 4, 5].map(i => (
                 <Skeleton key={i} className="h-[600px] w-[300px] shrink-0 rounded-xl" />
             ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search & Filters Toolbar */}
      <div className="flex-none px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Board</h1>
            
            <div className="h-6 w-px bg-border mx-2 hidden md:block" />

            {projects.length > 0 && (
              <div className="w-[180px]">
                <Select
                  title="Project"
                  options={projects.map(p => ({ label: p.name, value: p.id }))}
                  value={selectedProjectId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedProjectId(val);
                    router.push(`/board?project=${val}`);
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[240px]">
              <SearchInput
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dropdown
              trigger={
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              }
            >
              <DropdownItem onClick={() => {}}>Assignee</DropdownItem>
              <DropdownItem onClick={() => {}}>Priority</DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}}>Clear filters</DropdownItem>
            </Dropdown>

            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {selectedProjectId && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-vg-primary to-vg-purple hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {!selectedProjectId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LayoutGrid className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Select an existing project or create a new one to view its board.
              </p>
              <Button onClick={() => router.push('/projects')}>
                Go to Projects
              </Button>
            </div>
          ) : (
            <div className="flex h-full gap-6 min-w-max pb-8">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {COLUMNS.map((col) => (
                  <DroppableColumn
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    count={getFilteredTasks(col.id).length}
                    colorClass={columnColors[col.id]}
                    itemIds={getColumnTaskIds(col.id)}
                  >
                    {getFilteredTasks(col.id).map((issue) => (
                      <DraggableCard 
                        key={issue.id} 
                        issue={issue} 
                        onClick={() => openIssueDetail(issue.id)}
                      />
                    ))}
                  </DroppableColumn>
                ))}

                <DragOverlay>
                  {activeIssue ? (
                    <DraggableCard issue={activeIssue} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </div>

        {/* AI Chat / Bottom Input */}
        <div className="p-4 bg-linear-to-t from-background via-background/80 to-transparent">
          <ChatInput 
            placeholder="Ask AI to manage tasks... (e.g. 'Move UI fixes to In Progress')"
          />
        </div>
      </div>

      <IssueDetailModal onSave={loadIssues} />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalHeader>Create New Task</ModalHeader>
        <ModalBody>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            autoFocus
          />
          
          <TextArea
            label="Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Add details about this task..."
            rows={3}
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Priority
            </label>
            <div className="flex gap-2">
              {(["medium", "high", "urgent", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTaskPriority(p)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${newTaskPriority === p
                      ? "bg-vg-primary/10 border-vg-primary text-vg-primary"
                      : "bg-transparent border-input text-muted-foreground hover:bg-muted"
                    }
                  `}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !newTaskTitle.trim()}
              className="bg-vg-primary text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
        </ModalBody>
      </Modal>
    </div>
  );
}
