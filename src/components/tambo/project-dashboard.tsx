"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import { projectDashboardSchema } from "@/lib/tambo/schemas";
import { LayoutDashboard, CheckCircle2, ListTodo, AlertCircle, Lightbulb } from "lucide-react";

interface ProjectDashboardProps {
  projectName: string;
  activeSprintId?: string;
  totalTasks?: number;
  completedTasks?: number;
  aiInsights?: string[];
}

const ProjectDashboardBase = ({ 
  projectName, 
  totalTasks = 0, 
  completedTasks = 0, 
  aiInsights = [] 
}: ProjectDashboardProps) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{projectName}</h2>
            <p className="text-sm text-gray-500">Project Overview</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-blue-600">{completionRate}%</span>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Complete</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ListTodo className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <span className="text-xl font-bold">{totalTasks}</span>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Done</span>
          </div>
          <span className="text-xl font-bold text-green-700">{completedTasks}</span>
        </div>
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Remaining</span>
          </div>
          <span className="text-xl font-bold text-yellow-700">{totalTasks - completedTasks}</span>
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-700 mb-3">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-bold">AI Insights</span>
          </div>
          <ul className="space-y-2">
            {aiInsights.map((insight, idx) => (
              <li key={idx} className="text-xs text-indigo-900 flex gap-2">
                <span className="text-indigo-400">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ProjectDashboard = withInteractable(ProjectDashboardBase, {
  componentName: "ProjectDashboard",
  description: "A summary dashboard for the project with progress tracking and AI-driven insights.",
  propsSchema: projectDashboardSchema,
});
