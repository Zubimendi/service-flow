"use client";

import {
  Calendar,
  Check,
  Clock,
  Copy,
  DollarSign,
  MoreHorizontal,
  Percent,
  Plus,
  X,
} from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { useTodayAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatTime, cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const statusVariant: Record<
  AppointmentStatus,
  "pending" | "confirmed" | "cancelled" | "completed" | "info"
> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled",
};

interface TodayViewProps {
  slug: string;
  tenantName?: string;
}

export function TodayView({ slug, tenantName }: TodayViewProps) {
  const { data, isLoading } = useTodayAppointments(slug);
  const updateStatus = useUpdateAppointmentStatus(slug);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleConfirm = (id: string) => {
    updateStatus.mutate(
      { id, status: "CONFIRMED" },
      {
        onSuccess: () => toast({ title: "Appointment confirmed", variant: "success" }),
        onError: () =>
          toast({ title: "Failed to update", description: "Please try again.", variant: "error" }),
      }
    );
  };

  const handleCancel = (id: string) => {
    updateStatus.mutate(
      { id, status: "CANCELLED" },
      {
        onSuccess: () => toast({ title: "Appointment cancelled", variant: "default" }),
        onError: () =>
          toast({ title: "Failed to update", description: "Please try again.", variant: "error" }),
      }
    );
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/t/${slug}`);
    toast({ title: "Booking link copied!", variant: "success" });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const appointments = data?.appointments ?? [];
  const stats = data?.stats ?? { bookingsCount: 0, expectedRevenue: 0, occupancyRate: 0 };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-lg">
            {greeting}, {tenantName?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">
            Here&apos;s what&apos;s happening at your studio today, {dateLabel.split(",")[1]?.trim() ?? dateLabel}
          </p>
        </div>
        <Button className="shrink-0">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Today's Bookings"
          value={String(stats.bookingsCount)}
          icon={Calendar}
          trend={{ value: "+2 from yesterday", positive: true }}
        />
        <StatCard
          label="Expected Revenue"
          value={formatCurrency(stats.expectedRevenue)}
          icon={DollarSign}
          trend={{ value: "12% vs last week", positive: true }}
          iconClassName="bg-success-container"
        />
        <StatCard
          label="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={Percent}
          trend={{ value: "vs last week", positive: false }}
          iconClassName="bg-warning-container"
        />
      </div>

      {/* Schedule */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-surface-low/50 py-4">
          <h2 className="text-headline-sm">Today&apos;s Schedule</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              View Timeline
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Calendar}
                title="No appointments today"
                description="Your schedule is clear. Share your booking link to get new clients."
                actionLabel="Copy booking link"
                onAction={copyBookingLink}
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((apt) => {
                const isCompleted = apt.status === "COMPLETED";
                return (
                  <div
                    key={apt.id}
                    className={cn(
                      "group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-surface-low/40 sm:flex-row sm:items-center sm:justify-between",
                      isCompleted && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-bold tabular-nums">{formatTime(apt.startTime)}</p>
                        <p className="text-label-sm text-muted-foreground uppercase">
                          {apt.service.durationMinutes} min
                        </p>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{apt.client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold">{apt.client.name}</p>
                        <p className="text-body-md text-muted-foreground">{apt.service.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-[104px] sm:pl-0">
                      <div className="hidden items-center gap-1.5 text-body-md text-muted-foreground sm:flex">
                        <Clock className="h-3.5 w-3.5" />
                        {apt.staff.name}
                      </div>
                      <Badge variant={statusVariant[apt.status]}>
                        {apt.status.toLowerCase().replace("_", " ")}
                      </Badge>
                      {apt.status === "PENDING" && (
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:bg-success-container"
                            aria-label="Confirm appointment"
                            onClick={() => handleConfirm(apt.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive-container"
                            aria-label="Cancel appointment"
                            onClick={() => handleCancel(apt.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {appointments.length > 0 && (
            <button
              onClick={copyBookingLink}
              className="flex w-full items-center justify-center gap-2 border-t border-border bg-primary-light/40 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light/70"
            >
              <Copy className="h-4 w-4" />
              View all appointments · Share booking link
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
