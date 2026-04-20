"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select — Radix-обёртка с нашим glassmorphism-стилем (TZ 4.6).
 * Плавные анимации открытия/закрытия, keyboard-friendly.
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "md";
  }
>(({ className, children, size = "md", ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)]",
      "transition-all duration-150 ease-[var(--ease-out-standard)]",
      "focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-soft)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[placeholder]:text-[var(--text-tertiary)]",
      size === "sm" ? "h-9" : "h-11",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className="size-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={6}
      className={cn(
        "glass-strong z-50 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl p-1.5 shadow-2xl",
        "will-change-[opacity,transform]",
        "data-[state=open]:animate-[mm-fade-slide-in_180ms_var(--ease-out-standard)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-0">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-10 w-full cursor-pointer select-none items-center gap-2 rounded-xl px-3 pr-9 text-sm text-[var(--text-primary)]",
      "outline-none transition-colors",
      "data-[highlighted]:bg-[var(--accent-primary-soft)] data-[highlighted]:text-[var(--accent-primary)]",
      "data-[state=checked]:font-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center">
      <Check className="size-4 text-[var(--accent-primary)]" aria-hidden />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("mx-2 my-1 h-px bg-[var(--border-subtle)]", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
