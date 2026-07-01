import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopBar } from "@/features/dashboard/components/top-bar";
import { validateImpersonationToken } from "@/lib/admin/impersonation";
import { ImpersonationBanner } from "@/components/admin/ui/ImpersonationBanner";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/t/${params.slug}/dashboard`);
  }

  if (
    session.user.role !== "PLATFORM_ADMIN" &&
    session.user.tenantId
  ) {
    const tenant = await getTenantBySlug(params.slug);
    if (!tenant) notFound();
    if (session.user.tenantId !== tenant.id) {
      redirect("/login");
    }
  }

  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  // Check if active impersonation session matches current tenant
  const impersonation = await validateImpersonationToken();
  const isImpersonatingThisTenant = impersonation && impersonation.tenantId === tenant.id;

  return (
    <div 
      className="flex h-screen overflow-hidden bg-background"
      style={isImpersonatingThisTenant ? { paddingTop: '44px' } : undefined}
    >
      {isImpersonatingThisTenant && (
        <ImpersonationBanner tenantName={tenant.name} tenantId={tenant.id} />
      )}
      <Sidebar slug={params.slug} tenantName={tenant.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar tenantName={tenant.name} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

