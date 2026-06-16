import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-light text-primary",
        confirmed: "bg-success-container text-success",
        pending: "bg-warning-container text-warning",
        cancelled: "bg-destructive-container text-destructive",
        completed: "bg-surface-high text-muted-foreground",
        info: "bg-info-container text-info",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
