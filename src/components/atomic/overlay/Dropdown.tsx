// Dropdown Component
"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DropdownContextValue {
  isOpen: boolean;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue>({
  isOpen: false,
  close: () => {},
});

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "start",
  side = "bottom",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const close = () => setIsOpen(false);
  
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.left;
      const top = side === "bottom" ? rect.bottom + 4 : rect.top - 4;
      
      if (align === "center") {
        left = rect.left + rect.width / 2;
      } else if (align === "end") {
        left = rect.right;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, align, side]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);
  
  return (
    <DropdownContext.Provider value={{ isOpen, close }}>
      <div ref={triggerRef} className="inline-flex">
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      </div>
      
      {isOpen && createPortal(
        <div
          ref={contentRef}
          className={cn(
            "fixed z-50 min-w-[160px] py-1 bg-popover border border-border rounded-lg shadow-xl",
            "animate-in fade-in-0 zoom-in-95 duration-100",
            align === "center" && "-translate-x-1/2",
            align === "end" && "-translate-x-full",
            side === "top" && "-translate-y-full",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </DropdownContext.Provider>
  );
}

// Dropdown Item
export interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
  selected?: boolean;
}

export function DropdownItem({
  children,
  onClick,
  disabled,
  destructive,
  icon,
  shortcut,
  selected,
}: DropdownItemProps) {
  const { close } = useContext(DropdownContext);
  
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
        "hover:bg-accent focus:bg-accent focus:outline-none",
        disabled && "opacity-50 cursor-not-allowed",
        destructive && "text-destructive hover:text-destructive"
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
      {selected && <Check className="h-4 w-4" />}
      {shortcut && (
        <span className="text-xs text-muted-foreground ml-auto">{shortcut}</span>
      )}
    </button>
  );
}

// Dropdown Separator
export function DropdownSeparator() {
  return <div className="h-px my-1 bg-border" />;
}

// Dropdown Label
export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  );
}
