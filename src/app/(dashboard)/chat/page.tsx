"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider, type ContextHelpers } from "@tambo-ai/react";

/**
 * Chat page with full Tambo capabilities
 * Includes Context Helpers for AI awareness of current state
 */
export default function ChatPage() {
  const mcpServers = useMcpServers();

  // Context Helpers - provide AI with current state every message
  // Format: Record<string, ContextHelperFn> where key is context name
  const contextHelpers: ContextHelpers = {
    current_time: () => ({
      time: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    active_project: () => ({
      project: "Project Phoenix",
      sprint: "SPRINT-4",
      phase: "Phase 2: Agentic Swarm",
    }),
    user_context: () => ({
      role: "product_manager",
      name: "John Doe",
      permissions: ["view", "edit", "approve"],
    }),
  };

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={contextHelpers}
    >
      <div className="flex-1 flex flex-col h-full">
        <MessageThreadFull className="max-w-4xl mx-auto flex-1 w-full p-4" />
      </div>
    </TamboProvider>
  );
}
