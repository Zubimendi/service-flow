"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAppointmentsRange } from "@/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTime } from "@/lib/utils";
import { Calendar, DollarSign, Users } from "lucide-react";

const STAFF_COLORS = [
  { bg: "bg-primary-light", border: "border-l-primary", text: "text-primary" },
  { bg: "bg-success-container", border: "border-l-success", text: "text-success" },
  { bg: "bg-warning-container", border: "border-l-warning", text: "text-warning" },
  { bg: "bg-info-container", border: "border-l-info", text: "text-info" },
];

interface CalendarViewProps {
  slug: string;
}

export function CalendarView({ slug }: CalendarViewProps) {
  const [view, setView] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const rangeStart = view === "week"
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : currentDate;
  const rangeEnd = view === "week"
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : currentDate;

  const { data, isLoading } = useAppointmentsRange(
    slug,
    rangeStart.toISOString(),
    addDays(rangeEnd, 1).toISOString()
  );

  const staffColorMap = useMemo(() => {
    const map = new Map<string, number>();
    data?.appointments.forEach((apt) => {
      if (!map.has(apt.staffId)) map.set(apt.staffId, map.size % STAFF_COLORS.length);
    });
    return map;
  }, [data?.appointments]);

  const staffList = useMemo(() => {
    const map = new Map<string, string>();
    data?.appointments.forEach((apt) => map.set(apt.staffId, apt.staff.name));
    return Array.from(map.entries());
  }, [data?.appointments]);

  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i))
    : [currentDate];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  const appointments = data?.appointments ?? [];
  const totalRevenue = appointments.reduce((s, a) => s + a.service.price, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-headline-lg">Calendar</h1>
          <p className="mt-1 text-body-md text-muted-foreground">
            Manage your studio schedule and staff availability
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? -7 : -1))}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? 7 : 1))}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-semibold">
            {format(rangeStart, "MMM d")} – {format(rangeEnd, "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("day")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                view === "day" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                view === "week" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Week
            </button>
          </div>

          <div className="flex -space-x-2">
            {staffList.map(([id, name], i) => {
              const color = STAFF_COLORS[i % STAFF_COLORS.length];
              return (
                <div key={id} className="flex items-center gap-1.5 rounded-full border border-border bg-card pl-1 pr-3 py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className={cn("text-[10px]", color.bg, color.text)}>
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden">
        <div className={cn("grid divide-x divide-border", view === "week" ? "grid-cols-7" : "grid-cols-1")}>
          {days.map((day) => {
            const dayApts = appointments.filter((apt) =>
              isSameDay(parseISO(apt.startTime), day)
            );
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn("min-h-[320px] bg-card", isToday && "bg-primary-light/20")}
              >
                <div className={cn("border-b border-border px-3 py-3 text-center", isToday && "bg-primary/10")}>
                  <p className="text-label-sm text-muted-foreground uppercase">{format(day, "EEE")}</p>
                  <p className={cn("text-lg font-bold", isToday && "text-primary")}>{format(day, "d")}</p>
                </div>
                <div className="space-y-2 p-2">
                  {dayApts.map((apt) => {
                    const colorIdx = staffColorMap.get(apt.staffId) ?? 0;
                    const color = STAFF_COLORS[colorIdx];
                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "cursor-pointer rounded-lg border-l-[3px] p-2.5 transition-shadow hover:shadow-sm",
                          color.bg,
                          color.border
                        )}
                      >
                        <p className="text-xs font-bold tabular-nums">{formatTime(apt.startTime)}</p>
                        <p className="mt-0.5 truncate text-sm font-semibold">{apt.client.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{apt.service.name}</p>
                        <Badge variant="secondary" className="mt-1.5 text-[10px]">
                          {apt.staff.name.split(" ")[0]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Booked Slots" value={`${appointments.length} / 60`} icon={Calendar} />
        <StatCard
          label="Est. Revenue"
          value={`$${(totalRevenue / 100).toFixed(0)}`}
          icon={DollarSign}
          iconClassName="bg-success-container"
        />
        <StatCard
          label="Staff Active"
          value={String(staffList.length)}
          icon={Users}
          iconClassName="bg-info-container"
        />
      </div>
    </div>
  );
}
