"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { Button } from "@/components/atomic/button/Button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BoardChatSidebar({ isOpen, onClose }: BoardChatSidebarProps) {
  return (
    <div
      className={cn(
        "fixed top-14 right-0 bottom-0 z-40 w-[400px] bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-sm">Vangraph AI</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MessageThreadFull className="h-full w-full" />
      </div>
    </div>
  );
}
