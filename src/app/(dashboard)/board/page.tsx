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
  AlertCircle
} from "lucide-react";

// Import services
import {
  getIssuesByStatus,
  createIssue,
  updateIssuePosition,
  subscribeToIssues,
} from "@/services/supabase/issues";
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

export default function BoardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectIdParam);
  const [issues, setIssues] = useState<Record<IssueStatus, IssueWithKey[]> | null>(null);
  const [loading, setLoading] = useState(true);
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
    const activeData = active.data.current?.issue as IssueWithKey;
    if (activeData) {
      setActiveIssue(activeData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !selectedProjectId) {
      setActiveIssue(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current?.issue as IssueWithKey;
    if (!activeData) {
      setActiveIssue(null);
      return;
    }

    const currentStatus = active.data.current?.sortable?.containerId || activeData.status;
    const newStatus = over.data.current?.sortable?.containerId || over.id;

    const isValidStatus = (s: string): s is IssueStatus => 
      ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'].includes(s);

    if (!isValidStatus(newStatus)) {
        setActiveIssue(null);
        return;
    }

    if (currentStatus !== newStatus) {
        const oldIssues = { ...issues } as Record<IssueStatus, IssueWithKey[]>;
        const sourceColumn = [...(oldIssues[currentStatus as IssueStatus] || [])];
        const destColumn = [...(oldIssues[newStatus as IssueStatus] || [])];

        const movedIssue = { ...activeData, status: newStatus };
        
        setIssues({
            ...oldIssues,
            [currentStatus as IssueStatus]: sourceColumn.filter(i => i.id !== activeId),
            [newStatus as IssueStatus]: [...destColumn, movedIssue],
        });

        try {
            await updateIssuePosition(activeId, newStatus, 0); 
        } catch (error) {
            console.error("Failed to update issue position:", error);
            setIssues(oldIssues); 
        }
    }

    setActiveIssue(null);
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
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Board</h1>
            
            {projects.length > 0 ? (
                <div className="w-[200px]">
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
            ) : (
                <Badge variant="warning" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No Projects Found
                </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
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

      {/* Kanban Board */}
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
            <div className="flex h-full gap-6 min-w-max">
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
                    count={issues?.[col.id]?.length || 0}
                    colorClass="" // You might want to map this based on your columnColors if needed or existing logic
                    itemIds={issues?.[col.id]?.map(i => i.id) || []}
                >
                    {issues?.[col.id]?.map((issue) => (
                        <DraggableCard key={issue.id} issue={issue} />
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
