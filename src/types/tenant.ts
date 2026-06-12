import { Tenant, SubscriptionPlan, SubscriptionStatus, TenantStatus } from "@prisma/client";

export type BusinessHours = Record<
  string,
  { open: string; close: string; closed?: boolean }
>;

export interface TenantPublic {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  businessHours: BusinessHours;
  timezone: string;
  status: TenantStatus;
}

export interface TenantWithSubscription extends Tenant {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
}
