"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";

/**
 * Chat page with full Tambo capabilities
 * Inherits TamboContext from DashboardLayout
 */
export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageThreadFull className="max-w-4xl mx-auto flex-1 w-full p-4" />
    </div>
  );
}
