import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopBar } from "@/features/dashboard/components/top-bar";

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar slug={params.slug} tenantName={tenant.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
