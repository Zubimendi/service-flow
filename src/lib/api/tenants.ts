import { api } from "./client";
import { SignupInput } from "@/lib/validations/auth";
import { TenantPublic } from "@/types/tenant";

export const tenantsApi = {
  getPublic: (slug: string) =>
    api.get<{ tenant: TenantPublic; services: Array<{
      id: string;
      name: string;
      description: string | null;
      durationMinutes: number;
      price: number;
    }> }>(`/api/public/${slug}`),

  signup: (data: SignupInput) =>
    api.post<{ tenantId: string; slug: string }>("/api/auth/signup", data),

  updateSettings: (slug: string, data: Record<string, unknown>) =>
    api.patch<{ tenant: TenantPublic }>(`/api/tenants/${slug}/settings`, data),

  connectStripe: (slug: string) =>
    api.post<{ url: string }>(`/api/tenants/${slug}/stripe/connect`, {}),
};
