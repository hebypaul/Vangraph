"use client";

import { withInteractable } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Sparkles, CheckCircle2 } from "lucide-react";

// Schema for AIInsight
export const aiInsightSchema = z.object({
  isStreaming: z.boolean().default(false).describe("Whether the AI is currently thinking"),
  message: z.string().describe("The AI's insight message"),
  linkedTickets: z.array(z.object({
    id: z.string(),
    title: z.string().optional().default("Untitled Ticket"),
  })).optional().default([]).describe("Tickets mentioned in the insight"),
  suggestion: z.string().optional().describe("A specific suggestion the AI is making"),
});

export type AIInsightProps = z.infer<typeof aiInsightSchema>;

const AIInsightBase = ({
  isStreaming = false,
  message,
  linkedTickets = [],
  suggestion,
}: AIInsightProps) => {
  return (
    <div className="vg-ai-panel">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-vg-primary to-vg-purple flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-bold text-vg-primary uppercase tracking-wider">
          Vangraph AI
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-vg-success animate-pulse" />
            <span className="text-[8px] text-muted-foreground">Streaming</span>
          </span>
        )}
      </div>

      {/* Message */}
      <p
        className={cn(
          "text-sm text-foreground leading-relaxed",
          isStreaming && "animate-thinking-gradient"
        )}
      >
        {isStreaming ? "Analyzing sprint blockers..." : message}
      </p>

      {/* Linked Tickets */}
      {linkedTickets && linkedTickets.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {linkedTickets.map((ticket) => (
            <span
              key={ticket.id}
              className="px-2 py-1 rounded bg-vg-surface text-xs text-vg-primary cursor-pointer hover:bg-vg-surface-hover transition-colors"
            >
              {ticket.id}
            </span>
          ))}
        </div>
      )}

      {/* Suggestion */}
      {suggestion && (
        <div className="mt-3 p-3 rounded-lg bg-vg-surface border border-vg-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Suggested Action:</p>
          <p className="text-sm text-foreground">{suggestion}</p>
        </div>
      )}
    </div>
  );
};

export const AIInsight = withInteractable(AIInsightBase, {
  componentName: "AIInsight",
  description: "Displays AI-generated insights and suggestions about the project",
  propsSchema: aiInsightSchema,
});
