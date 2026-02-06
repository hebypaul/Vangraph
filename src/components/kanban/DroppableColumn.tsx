"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import clsx from "clsx";
import { Plus } from "lucide-react";

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  colorClass: string;
  itemIds: string[];
  isLoading?: boolean;
  onAddClick?: () => void;
  children: React.ReactNode;
}

const columnColorBorders: Record<string, string> = {
  backlog: "border-l-slate-500",
  todo: "border-l-slate-400",
  in_progress: "border-l-cyan-500",
  in_review: "border-l-amber-500",
  done: "border-l-emerald-500",
  cancelled: "border-l-red-500",
};

export function DroppableColumn({
  id,
  title,
  count,
  itemIds,
  isLoading = false,
  onAddClick,
  children,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-1 min-w-[300px] max-w-[340px] flex flex-col",
        "bg-card/30 backdrop-blur-sm rounded-xl",
        "border-l-4 border border-border/50",
        columnColorBorders[id] || "border-l-slate-500",
        // Drop zone active state
        isOver && "ring-2 ring-primary/40 bg-primary/5 border-primary/30",
        "transition-all duration-200"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-4 pb-2">
        <span
          className={clsx(
            "w-2 h-2 rounded-full",
            id === "backlog" && "bg-slate-500",
            id === "todo" && "bg-slate-400",
            id === "in_progress" && "bg-cyan-500",
            id === "in_review" && "bg-amber-500",
            id === "done" && "bg-emerald-500",
            id === "cancelled" && "bg-red-500"
          )}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
          {isLoading ? "..." : count}
        </span>
      </div>

      {/* Sortable Items Container */}
      <div className="flex-1 px-3 pb-3 overflow-y-auto">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[100px]">
            {children}
          </div>
        </SortableContext>
      </div>

      {/* Add Task Button */}
      {onAddClick && (
        <button
          onClick={onAddClick}
          className={clsx(
            "mx-3 mb-3 p-2 rounded-lg text-sm",
            "border border-dashed border-border",
            "text-muted-foreground",
            "hover:border-primary/50 hover:text-primary hover:bg-primary/5",
            "flex items-center justify-center gap-1",
            "transition-colors duration-200"
          )}
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      )}
    </div>
  );
}
