import { TodayView } from "@/features/scheduling/components/today-view";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { notFound } from "next/navigation";

export default async function DashboardPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  return <TodayView slug={params.slug} tenantName={tenant.name} />;
}
