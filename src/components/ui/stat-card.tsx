import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-caption">{label}</p>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-display text-3xl md:text-4xl">{value}</p>
            )}
            {trend && !isLoading && (
              <p className="text-caption text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
