"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog (TZ 4.6, 6.3 Flow 2).
 * Поведение по экрану:
 *   - mobile: bottom-sheet (slide-up + drag handle)
 *   - desktop center: модалка по центру
 *   - desktop right: drawer справа
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-mm="overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/35 backdrop-blur-[6px]",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type Side = "center" | "right" | "bottom" | "auto";

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /**
   * "auto" (default) → bottom на мобильном, right на десктопе.
   * "center" → modal по центру.
   */
  side?: Side;
};

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, side = "center", ...props }, ref) => {
  const isAutoSheet = side === "auto" || side === "right" || side === "bottom";

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-mm={
          side === "center"
            ? "dialog-center"
            : side === "right"
              ? "dialog-right"
              : side === "bottom"
                ? "dialog-bottom"
                : "dialog-auto"
        }
        className={cn(
          "glass-strong fixed z-50 flex flex-col gap-4 text-[var(--text-primary)] outline-none",
          // CENTER
          side === "center" &&
            "left-1/2 top-1/2 w-[min(94vw,480px)] max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 sm:p-6 overflow-y-auto",
          // RIGHT (desktop only)
          side === "right" &&
            "right-0 top-0 h-dvh w-[min(94vw,480px)] rounded-l-3xl p-5 sm:p-6 overflow-y-auto",
          // BOTTOM
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)] overflow-y-auto",
          // AUTO: bottom-sheet on mobile, right-drawer on desktop
          side === "auto" &&
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)] overflow-y-auto md:inset-auto md:right-0 md:top-0 md:bottom-auto md:h-dvh md:max-h-none md:w-[min(94vw,480px)] md:rounded-t-none md:rounded-l-3xl md:p-6",
          className,
        )}
        {...props}
      >
        {/* Drag handle на мобильном bottom-sheet */}
        {isAutoSheet && (
          <div
            aria-hidden
            className={cn(
              "mx-auto -mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-[var(--border-strong)]",
              side === "right" ? "hidden" : side === "auto" ? "md:hidden" : "",
            )}
          />
        )}
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--accent-primary-soft)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          aria-label="Закрыть"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5", className)} {...props} />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("pr-8 text-[19px] sm:text-[20px] font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--text-secondary)] leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
