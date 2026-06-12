"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SlideOver = DialogPrimitive.Root;
const SlideOverTrigger = DialogPrimitive.Trigger;
const SlideOverClose = DialogPrimitive.Close;

const SlideOverPortal = DialogPrimitive.Portal;

const SlideOverOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SlideOverOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SlideOverContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SlideOverPortal>
    <SlideOverOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SlideOverPortal>
));
SlideOverContent.displayName = DialogPrimitive.Content.displayName;

function SlideOverHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between border-b border-border px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SlideOverTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-h2", className)}
      {...props}
    />
  );
}

function SlideOverBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props} />;
}

function SlideOverCloseButton() {
  return (
    <DialogPrimitive.Close
      className="rounded-lg p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Close panel"
    >
      <X className="h-4 w-4" />
    </DialogPrimitive.Close>
  );
}

export {
  SlideOver,
  SlideOverTrigger,
  SlideOverClose,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
  SlideOverBody,
  SlideOverCloseButton,
};
