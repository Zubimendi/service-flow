"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/lib/api/appointments";
import { AppointmentStatus } from "@prisma/client";

export function useTodayAppointments(slug: string) {
  return useQuery({
    queryKey: ["appointments", "today", slug],
    queryFn: () => appointmentsApi.getToday(slug),
  });
}

export function useAppointmentsRange(slug: string, start: string, end: string) {
  return useQuery({
    queryKey: ["appointments", "range", slug, start, end],
    queryFn: () => appointmentsApi.getRange(slug, start, end),
    enabled: !!start && !!end,
  });
}

export function useUpdateAppointmentStatus(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsApi.updateStatus(slug, id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["appointments", "today", slug] });
      const previous = queryClient.getQueryData(["appointments", "today", slug]);

      queryClient.setQueryData(
        ["appointments", "today", slug],
        (old: { appointments: Array<{ id: string; status: AppointmentStatus }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            appointments: old.appointments.map((apt) =>
              apt.id === id ? { ...apt, status } : apt
            ),
          };
        }
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["appointments", "today", slug], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useAvailableSlots(slug: string, serviceId: string, date: string) {
  return useQuery({
    queryKey: ["slots", slug, serviceId, date],
    queryFn: () => appointmentsApi.getSlots(slug, serviceId, date),
    enabled: !!serviceId && !!date,
  });
}
