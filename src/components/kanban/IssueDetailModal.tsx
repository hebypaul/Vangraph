"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/atomic/overlay/Modal";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Button } from "@/components/atomic/button/Button";
import {
  Calendar,
  User,
  Tag,
  Clock,
  Edit2,
  CheckCircle,
  AlertCircle,
  Target,
  Layers,
  Play,
  Flag,
  Users,
} from "lucide-react";
import { getIssueById, updateIssue } from "@/services/supabase/issues";
import type { IssueWithKey, IssueStatus, Priority } from "@/types";
import clsx from "clsx";

// Status configuration
const statusConfig: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  backlog: { label: "Backlog", color: "text-slate-400", bg: "bg-slate-500" },
  todo: { label: "To Do", color: "text-slate-300", bg: "bg-slate-400" },
  in_progress: { label: "In Progress", color: "text-cyan-400", bg: "bg-cyan-500" },
  in_review: { label: "In Review", color: "text-amber-400", bg: "bg-amber-500" },
  done: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500" },
};

// Priority configuration
const priorityConfig: Record<Priority, { label: string; color: string; icon: string }> = {
  none: { label: "None", color: "text-muted-foreground", icon: "○" },
  low: { label: "Low", color: "text-slate-400", icon: "▽" },
  medium: { label: "Medium", color: "text-cyan-400", icon: "◇" },
  high: { label: "High", color: "text-amber-400", icon: "△" },
  urgent: { label: "Urgent", color: "text-red-400", icon: "⬆" },
};

// Property row component for consistent styling
function PropertyRow({ 
  icon: Icon, 
  label, 
  children 
}: { 
  icon: React.ElementType; 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

interface IssueDetailModalProps {
  onSave?: () => void; // Callback to notify parent when issue is saved
}

export function IssueDetailModal({ onSave }: IssueDetailModalProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  const [issue, setIssue] = useState<IssueWithKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<IssueStatus>("backlog");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editEstimate, setEditEstimate] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editStartDate, setEditStartDate] = useState<string>("");

  // Load issue when ticketId changes
  useEffect(() => {
    if (ticketId) {
      loadIssue(ticketId);
    } else {
      setIssue(null);
      setLoadError(null);
      setIsEditing(false);
    }
  }, [ticketId]);

  const loadIssue = async (id: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getIssueById(id);
      setIssue(data);
      if (data) {
        setEditTitle(data.title);
        setEditDescription(data.description || "");
        setEditStatus(data.status);
        setEditPriority(data.priority);
        setEditEstimate(data.estimate_points?.toString() || "");
        setEditDueDate(data.due_date || "");
        setEditStartDate(data.started_at?.split("T")[0] || "");
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to load issue:", errMsg, error);
      setLoadError(errMsg || "Unknown error loading issue");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    router.push("/board", { scroll: false });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!issue) return;
    setIsSaving(true);
    try {
      await updateIssue(issue.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        estimate_points: editEstimate ? parseInt(editEstimate) : null,
        due_date: editDueDate || null,
        started_at: editStartDate ? new Date(editStartDate).toISOString() : null,
      });
      await loadIssue(issue.id);
      setIsEditing(false);
      // Notify parent to refresh the board
      onSave?.();
    } catch (error) {
      console.error("Failed to save issue:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isOpen = !!ticketId;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={closeModal} 
      size="full"
      showCloseButton={false}
    >
      <div className="max-h-[85vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : issue ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {issue.key}
                </span>
                <div className={clsx("w-2 h-2 rounded-full", statusConfig[issue.status].bg)} />
                <span className={clsx("text-sm", statusConfig[issue.status].color)}>
                  {statusConfig[issue.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                /* ==================== EDIT MODE ==================== */
                <div className="p-6 space-y-6">
                  <Input
                    label="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Issue title"
                  />
                  
                  <TextArea
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    placeholder="Add a description..."
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                      >
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as Priority)}
                      >
                        {Object.entries(priorityConfig).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Estimate */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Estimate (pts)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={editEstimate}
                        onChange={(e) => setEditEstimate(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleSave}
                      isLoading={isSaving}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                /* ==================== VIEW MODE - 2 Column Layout ==================== */
                <div className="flex flex-col md:flex-row">
                  {/* Left Column - Main Content */}
                  <div className="flex-1 p-6 md:border-r border-border">
                    {/* Title */}
                    <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                      {issue.title}
                    </h1>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Description
                      </h3>
                      {issue.description ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {issue.description}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-sm">
                          No description provided
                        </p>
                      )}
                    </div>

                    {/* Labels */}
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          Labels
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {issue.labels.map((label) => (
                            <span
                              key={label.id}
                              className="px-2.5 py-1 text-xs font-medium rounded-full"
                              style={{ 
                                backgroundColor: `${label.color}20`, 
                                color: label.color,
                                border: `1px solid ${label.color}40`
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity placeholder */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Activity
                      </h3>
                      <p className="text-muted-foreground text-sm italic">
                        Activity log coming soon...
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Properties Panel */}
                  <div className="w-full md:w-80 shrink-0 p-6 bg-card/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                      Properties
                    </h3>

                    <div className="divide-y divide-border/50">
                      {/* Status */}
                      <PropertyRow icon={Target} label="Status">
                        <span className={clsx("flex items-center gap-2", statusConfig[issue.status].color)}>
                          <span className={clsx("w-2 h-2 rounded-full", statusConfig[issue.status].bg)} />
                          {statusConfig[issue.status].label}
                        </span>
                      </PropertyRow>

                      {/* Priority */}
                      <PropertyRow icon={Flag} label="Priority">
                        <span className={clsx("flex items-center gap-1.5", priorityConfig[issue.priority].color)}>
                          <span>{priorityConfig[issue.priority].icon}</span>
                          {priorityConfig[issue.priority].label}
                        </span>
                      </PropertyRow>

                      {/* Assignee */}
                      <PropertyRow icon={User} label="Assignee">
                        {issue.assignee ? (
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                              {(issue.assignee.full_name || issue.assignee.email || "?")[0].toUpperCase()}
                            </span>
                            {issue.assignee.full_name || issue.assignee.email}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </PropertyRow>

                      {/* Reporter */}
                      <PropertyRow icon={Users} label="Reporter">
                        <span className="text-muted-foreground italic">Not set</span>
                      </PropertyRow>

                      {/* Sprint */}
                      <PropertyRow icon={Layers} label="Sprint">
                        {issue.sprint ? (
                          <span className="text-foreground">{issue.sprint.name}</span>
                        ) : (
                          <span className="text-muted-foreground italic">No sprint</span>
                        )}
                      </PropertyRow>

                      {/* Module */}
                      <PropertyRow icon={AlertCircle} label="Module">
                        {issue.module ? (
                          <span 
                            className="px-2 py-0.5 text-xs rounded"
                            style={{ 
                              backgroundColor: `${issue.module.color}20`,
                              color: issue.module.color 
                            }}
                          >
                            {issue.module.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">No module</span>
                        )}
                      </PropertyRow>

                      {/* Estimate */}
                      <PropertyRow icon={Clock} label="Estimate">
                        {issue.estimate_points ? (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                            {issue.estimate_points} pts
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Not estimated</span>
                        )}
                      </PropertyRow>

                      {/* Due Date */}
                      <PropertyRow icon={Calendar} label="Due Date">
                        <span className={clsx(
                          issue.due_date && (() => {
                            const dueDate = new Date(issue.due_date);
                            const today = new Date();
                            // Compare by calendar day only (due date is considered overdue if it's before today, not today itself)
                            dueDate.setHours(23, 59, 59, 999);
                            today.setHours(0, 0, 0, 0);
                            return dueDate < today;
                          })()
                            ? "text-red-400" 
                            : "text-foreground"
                        )}>
                          {formatDate(issue.due_date)}
                        </span>
                      </PropertyRow>

                      {/* Start Date */}
                      <PropertyRow icon={Play} label="Started">
                        {formatDate(issue.started_at)}
                      </PropertyRow>

                      {/* Created */}
                      <PropertyRow icon={Tag} label="Created">
                        {formatDate(issue.created_at)}
                      </PropertyRow>

                      {/* Updated */}
                      <PropertyRow icon={Tag} label="Updated">
                        {formatDate(issue.updated_at)}
                      </PropertyRow>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            {loadError ? (
              <>
                <p className="text-red-400 font-medium mb-2">Error loading issue</p>
                <p className="text-muted-foreground text-sm">{loadError}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Issue not found</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
