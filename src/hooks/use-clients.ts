"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api/clients";
import { ClientInput } from "@/lib/validations/client";

export function useClients(slug: string, search?: string) {
  return useQuery({
    queryKey: ["clients", slug, search],
    queryFn: () => clientsApi.list(slug, search),
  });
}

export function useClient(slug: string, id: string | null) {
  return useQuery({
    queryKey: ["clients", slug, id],
    queryFn: () => clientsApi.get(slug, id!),
    enabled: !!id,
  });
}

export function useCreateClient(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientInput) => clientsApi.create(slug, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients", slug] }),
  });
}

export function useUpdateClient(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientInput }) =>
      clientsApi.update(slug, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients", slug] }),
  });
}
