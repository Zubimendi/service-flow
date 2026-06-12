"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "@/lib/api/tenants";

export function usePublicTenant(slug: string) {
  return useQuery({
    queryKey: ["tenant", "public", slug],
    queryFn: () => tenantsApi.getPublic(slug),
  });
}
