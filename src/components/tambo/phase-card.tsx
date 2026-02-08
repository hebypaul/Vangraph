"use client";

import { withInteractable } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap, Users, AlertTriangle } from "lucide-react";

// Schema for PhaseCard
export const phaseCardSchema = z.object({
  phaseName: z.string().describe("Phase name like 'Phase 2: Agentic Swarm'"),
  phaseNumber: z.number().describe("Phase number"),
  dateRange: z.string().optional().describe("Date range like 'Oct 10 - Oct 24'"),
  description: z.string().optional().default("").describe("Phase description"),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(["done", "in-progress", "pending"]).optional().default("pending"),
  })).optional().default([]),
  metrics: z.object({
    velocity: z.number().optional().default(0).describe("Sprint velocity in points"),
    teamActive: z.number().optional().default(0).describe("Number of active team members"),
    blockers: z.number().optional().default(0).describe("Number of critical blockers"),
  }).optional().default({
    velocity: 0,
    teamActive: 0,
    blockers: 0,
  }),
});

export type PhaseCardProps = z.infer<typeof phaseCardSchema>;

const PhaseCardBase = ({
  phaseName,
  phaseNumber,
  dateRange,
  description,
  steps = [],
  metrics = { velocity: 0, teamActive: 0, blockers: 0 },
}: PhaseCardProps) => {
  return (
    <div className="vg-card max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="danger">CURRENT PHASE</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateRange}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{phaseName}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-vg-primary/20 flex items-center justify-center text-vg-primary">
          <Zap className="w-6 h-6" />
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2 my-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                step.status === "done" && "bg-vg-primary border-vg-primary",
                step.status === "in-progress" && "border-vg-primary bg-transparent",
                step.status === "pending" && "border-muted-foreground bg-transparent"
              )}
            >
              {step.status === "done" && (
                <span className="text-[8px] text-primary-foreground">✓</span>
              )}
              {step.status === "in-progress" && (
                <span className="w-2 h-2 rounded-full bg-vg-primary" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] text-center",
                step.status === "done" && "text-foreground",
                step.status === "in-progress" && "text-vg-primary font-semibold",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.name}
            </span>
            <span
              className={cn(
                "text-[8px]",
                step.status === "done" && "text-muted-foreground",
                step.status === "in-progress" && "text-vg-primary",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.status === "done" ? "Done" : step.status === "in-progress" ? "In Progress" : "Pending"}
            </span>
          </div>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vg-surface flex items-center justify-center text-vg-primary">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Velocity</span>
            <p className="text-lg font-bold text-foreground">{metrics.velocity} pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vg-surface flex items-center justify-center text-vg-success">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Team</span>
            <p className="text-lg font-bold text-foreground">{metrics.teamActive} Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vg-surface flex items-center justify-center text-vg-danger">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Blockers</span>
            <p className="text-lg font-bold text-foreground">{metrics.blockers} Critical</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PhaseCard = withInteractable(PhaseCardBase, {
  componentName: "PhaseCard",
  description: "Displays a project phase with progress stepper and key metrics",
  propsSchema: phaseCardSchema,
});
