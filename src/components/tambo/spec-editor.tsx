"use client";

import { useState } from "react";
import { Check, X, FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface SpecEditorProps {
  content: string;
  status: "draft" | "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
}

export function SpecEditor({ content, status: initialStatus, onApprove, onReject }: SpecEditorProps) {
  const [status, setStatus] = useState(initialStatus);

  const handleApprove = () => {
    setStatus("approved");
    if (onApprove) onApprove();
  };

  const handleReject = () => {
    setStatus("rejected");
    if (onReject) onReject();
  };

  return (
    <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm">Implementation Plan</span>
        </div>
        <div className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium border",
          status === "draft" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          status === "approved" && "bg-green-500/10 text-green-500 border-green-500/20",
          status === "rejected" && "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {status.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto prose dark:prose-invert prose-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* Actions */}
      {status === "draft" && (
        <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/10">
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Approve & Execute
          </button>
        </div>
      )}
      
      {status === "approved" && (
         <div className="flex items-center justify-center p-3 border-t border-border bg-green-500/5 text-green-600 text-xs font-medium">
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Plan approved for execution.
         </div>
      )}
    </div>
  );
}
