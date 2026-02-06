// Input Component
"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    success,
    hint,
    leftIcon,
    rightIcon,
    type = "text",
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm",
              "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive focus-visible:ring-destructive" : "border-border",
              success && !error && "border-emerald-500 focus-visible:ring-emerald-500",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <p className={cn(
            "mt-1.5 text-xs",
            error && "text-destructive",
            success && !error && "text-emerald-500",
            !error && !success && "text-muted-foreground"
          )}>
            {error || success || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
