"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api/services";
import { ServiceInput } from "@/lib/validations/service";

export function useServices(slug: string) {
  return useQuery({
    queryKey: ["services", slug],
    queryFn: () => servicesApi.list(slug),
  });
}

export function useCreateService(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceInput) => servicesApi.create(slug, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services", slug] }),
  });
}

export function useUpdateService(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceInput }) =>
      servicesApi.update(slug, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services", slug] }),
  });
}

export function useDeleteService(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(slug, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services", slug] }),
  });
}
