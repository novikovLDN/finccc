"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-4 py-2 text-sm",
        "placeholder:text-[var(--text-tertiary)]",
        "transition-all duration-150 ease-[var(--ease-out-standard)]",
        "focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-soft)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-4 py-3 text-sm",
      "placeholder:text-[var(--text-tertiary)]",
      "transition-all duration-150 ease-[var(--ease-out-standard)]",
      "focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-soft)] focus:outline-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-xs font-medium text-[var(--text-secondary)]", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
