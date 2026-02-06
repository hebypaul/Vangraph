// LoadingButton Component
"use client";

import { Button, type ButtonProps } from "./Button";

export interface LoadingButtonProps extends ButtonProps {
  loadingText?: string;
}

export function LoadingButton({ 
  isLoading, 
  loadingText,
  children,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button isLoading={isLoading} {...props}>
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
