"use client";

import { Calendar, Check, DollarSign, Percent, X } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { useTodayAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatTime } from "@/lib/utils";

const statusVariant: Record<AppointmentStatus, "pending" | "confirmed" | "cancelled" | "info" | "secondary"> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "info",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled",
};

interface TodayViewProps {
  slug: string;
}

export function TodayView({ slug }: TodayViewProps) {
  const { data, isLoading } = useTodayAppointments(slug);
  const updateStatus = useUpdateAppointmentStatus(slug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const appointments = data?.appointments ?? [];
  const stats = data?.stats ?? { bookingsCount: 0, expectedRevenue: 0, occupancyRate: 0 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 mb-1">Today</h1>
        <p className="text-caption">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Today's Bookings"
          value={String(stats.bookingsCount)}
          icon={Calendar}
        />
        <StatCard
          label="Expected Revenue"
          value={formatCurrency(stats.expectedRevenue)}
          icon={DollarSign}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={Percent}
        />
      </div>

      <div>
        <h2 className="text-h2 mb-4">Agenda</h2>
        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments today"
            description="Your schedule is clear. Share your booking link to get new clients."
            actionLabel="Copy booking link"
            onAction={() => navigator.clipboard.writeText(`${window.location.origin}/t/${slug}`)}
          />
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium tabular-nums text-muted-foreground w-20">
                    {formatTime(apt.startTime)}
                  </div>
                  <div>
                    <p className="font-medium">{apt.client.name}</p>
                    <p className="text-caption">{apt.service.name} with {apt.staff.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[apt.status]}>
                    {apt.status.toLowerCase()}
                  </Badge>
                  {apt.status === "PENDING" && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Confirm appointment"
                        onClick={() =>
                          updateStatus.mutate({ id: apt.id, status: "CONFIRMED" })
                        }
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cancel appointment"
                        onClick={() =>
                          updateStatus.mutate({ id: apt.id, status: "CANCELLED" })
                        }
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
