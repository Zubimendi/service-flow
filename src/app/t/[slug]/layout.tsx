import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/db/tenant-client";

export default async function TenantPublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant || tenant.status === "SUSPENDED") notFound();

  return (
    <div
      style={{ "--tenant-primary": tenant.primaryColor } as React.CSSProperties}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
