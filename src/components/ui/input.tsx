"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Input — базовый input с плавным focus-ring через Motion (TZ 4.6).
 * Мягкая граница → primary + soft glow при фокусе.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leadingIcon, trailingIcon, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);

    return (
      <motion.div
        animate={{
          borderColor: focused ? "var(--accent-primary)" : "var(--border-strong)",
          boxShadow: focused
            ? "0 0 0 4px var(--accent-primary-soft)"
            : "0 0 0 0px transparent",
        }}
        transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        className={cn(
          "group flex h-11 items-center rounded-xl border bg-[var(--surface-1)] px-3",
          "disabled-within:cursor-not-allowed",
          className,
        )}
        style={{ borderColor: "var(--border-strong)" }}
      >
        {leadingIcon && (
          <span className="mr-2 flex shrink-0 text-[var(--text-tertiary)] [&_svg]:size-4">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
          {...props}
        />
        {trailingIcon && (
          <span className="ml-2 flex shrink-0 text-[var(--text-tertiary)] [&_svg]:size-4">
            {trailingIcon}
          </span>
        )}
      </motion.div>
    );
  },
);
Input.displayName = "Input";

/**
 * DateInput — обёртка над type="date" с календарной иконкой,
 * чтобы выглядел единообразно с остальными полями.
 */
export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        leadingIcon={<CalendarIcon />}
        className={cn("tabular [&>input]:text-sm", className)}
        {...props}
      />
    );
  },
);
DateInput.displayName = "DateInput";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, onFocus, onBlur, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <motion.div
      animate={{
        borderColor: focused ? "var(--accent-primary)" : "var(--border-strong)",
        boxShadow: focused ? "0 0 0 4px var(--accent-primary-soft)" : "0 0 0 0px transparent",
      }}
      transition={{ duration: 0.15 }}
      className={cn("flex rounded-xl border bg-[var(--surface-1)]", className)}
      style={{ borderColor: "var(--border-strong)" }}
    >
      <textarea
        ref={ref}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className="flex min-h-[88px] w-full resize-none bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
        {...props}
      />
    </motion.div>
  );
});
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
