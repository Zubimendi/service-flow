import { api } from "./client";
import { ServiceInput } from "@/lib/validations/service";

export interface ServiceDto {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  assignedStaffIds: string[];
  isActive: boolean;
}

export const servicesApi = {
  list: (slug: string) =>
    api.get<{ services: ServiceDto[] }>(`/api/tenants/${slug}/services`),

  create: (slug: string, data: ServiceInput) =>
    api.post<{ service: ServiceDto }>(`/api/tenants/${slug}/services`, data),

  update: (slug: string, id: string, data: ServiceInput) =>
    api.patch<{ service: ServiceDto }>(`/api/tenants/${slug}/services/${id}`, data),

  delete: (slug: string, id: string) =>
    api.delete<void>(`/api/tenants/${slug}/services/${id}`),
};
