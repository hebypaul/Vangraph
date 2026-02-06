// Modal Component
"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconButton } from "../button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && closeOnOverlay) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={cn(
          "relative w-full bg-card border border-border rounded-xl shadow-2xl",
          "animate-in zoom-in-95 duration-200",
          sizes[size],
          className
        )}
      >
        {showCloseButton && (
          <IconButton
            aria-label="Close modal"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-3 top-3 z-10"
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Modal sub-components
export function ModalHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-b border-border", className)}>
      <h2 className="text-lg font-semibold text-foreground">{children}</h2>
    </div>
  );
}

export function ModalBody({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-t border-border flex justify-end gap-3", className)}>
      {children}
    </div>
  );
}
