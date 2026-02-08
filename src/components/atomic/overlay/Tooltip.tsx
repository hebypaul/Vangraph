// Tooltip Component
"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 300,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const show = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;
        
        switch (side) {
          case "top":
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            break;
          case "bottom":
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            break;
          case "right":
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            break;
        }
        
        setPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };
  
  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </div>
      
      {isVisible && !disabled && createPortal(
        <div
          className={cn(
            "fixed z-50 px-2 py-1 text-xs bg-popover border border-border rounded shadow-lg pointer-events-none text-popover-foreground",
            "animate-in fade-in-0 zoom-in-95 duration-100",
            side === "top" && "-translate-x-1/2 -translate-y-full",
            side === "bottom" && "-translate-x-1/2",
            side === "left" && "-translate-x-full -translate-y-1/2",
            side === "right" && "-translate-y-1/2",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
