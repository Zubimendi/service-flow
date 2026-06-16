import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  isLoading?: boolean;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  isLoading,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-label-md text-muted-foreground normal-case tracking-normal font-medium">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-12 w-28" />
            ) : (
              <p className="text-display-metrics text-3xl md:text-[40px]">{value}</p>
            )}
            {trend && !isLoading && (
              <p
                className={cn(
                  "text-label-sm font-semibold",
                  trend.positive ? "text-success" : "text-muted-foreground"
                )}
              >
                {trend.positive ? "↑ " : ""}{trend.value}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light",
              iconClassName
            )}
          >
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
