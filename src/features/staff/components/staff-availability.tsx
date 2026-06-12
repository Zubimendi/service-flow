"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { availabilitySchema, AvailabilityInput } from "@/lib/validations/availability";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface StaffAvailabilityProps {
  slug: string;
}

export function StaffAvailability({ slug }: StaffAvailabilityProps) {
  const queryClient = useQueryClient();

  const { data: staffData } = useQuery({
    queryKey: ["staff", slug],
    queryFn: () => api.get<{ staff: Array<{ id: string; name: string }> }>(`/api/tenants/${slug}/staff`),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["availability", slug],
    queryFn: () =>
      api.get<{
        availabilities: Array<{
          id: string;
          userId: string;
          dayOfWeek: number;
          startTime: string;
          endTime: string;
          user: { name: string };
        }>;
      }>(`/api/tenants/${slug}/staff/availability`),
  });

  const createMutation = useMutation({
    mutationFn: (input: AvailabilityInput) =>
      api.post(`/api/tenants/${slug}/staff/availability`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["availability", slug] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/tenants/${slug}/staff/availability?id=${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["availability", slug] }),
  });

  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const availabilities = data?.availabilities ?? [];
  const staff = staffData?.staff ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-h1">Staff Availability</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            className="grid gap-4 md:grid-cols-4"
          >
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select
                onValueChange={(v) => form.setValue("userId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Day</Label>
              <Select
                defaultValue="1"
                onValueChange={(v) => form.setValue("dayOfWeek", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, i) => (
                    <SelectItem key={day} value={String(i)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="time" {...form.register("startTime")} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="time" {...form.register("endTime")} />
            </div>
            <Button type="submit" className="md:col-span-4 md:w-auto">
              Add Slot
            </Button>
          </form>
        </CardContent>
      </Card>

      {availabilities.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No availability set"
          description="Add working hours for your staff to enable booking."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Staff</th>
                <th className="px-4 py-3 text-left font-medium">Day</th>
                <th className="px-4 py-3 text-left font-medium">Hours</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availabilities.map((avail) => (
                <tr key={avail.id} className="border-b border-border">
                  <td className="px-4 py-3">{avail.user.name}</td>
                  <td className="px-4 py-3">{DAYS[avail.dayOfWeek]}</td>
                  <td className="px-4 py-3">{avail.startTime} — {avail.endTime}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(avail.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
