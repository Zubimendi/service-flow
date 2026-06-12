import { api } from "./client";
import { ClientInput } from "@/lib/validations/client";

export interface ClientWithCount {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  _count: { appointments: number };
}

export interface ClientDetail extends ClientWithCount {
  appointments: Array<{
    id: string;
    startTime: string;
    status: string;
    service: { name: string };
  }>;
}

export const clientsApi = {
  list: (slug: string, search?: string) =>
    api.get<{ clients: ClientWithCount[] }>(
      `/api/tenants/${slug}/clients${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),

  get: (slug: string, id: string) =>
    api.get<{ client: ClientDetail }>(`/api/tenants/${slug}/clients/${id}`),

  create: (slug: string, data: ClientInput) =>
    api.post<{ client: ClientWithCount }>(`/api/tenants/${slug}/clients`, data),

  update: (slug: string, id: string, data: ClientInput) =>
    api.patch<{ client: ClientWithCount }>(`/api/tenants/${slug}/clients/${id}`, data),
};
