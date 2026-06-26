import { z } from 'zod';

export const UpdateTenantStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export const UpdateTenantPlanSchema = z.object({
  plan: z.enum(['FREE', 'STARTER', 'PRO']), // FREE maps to STARTER in enum if needed, wait schema uses STARTER/PRO/ENTERPRISE
});

export const ImpersonateSchema = z.object({
  tenantId: z.string(),
});

export const ToggleFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  tenantId: z.string().nullable().optional(),
});
