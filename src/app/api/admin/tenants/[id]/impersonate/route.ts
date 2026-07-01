import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { createImpersonationToken, clearImpersonationToken } from "@/lib/admin/impersonation";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { adminDb } from "@/lib/admin/adminDb";

/** POST /api/admin/tenants/[id]/impersonate — start impersonation */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const tenant = await adminDb.tenant.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, name: true, status: true },
  });

  if (!tenant) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  if (tenant.status === "SUSPENDED") {
    return NextResponse.json({ message: "Cannot impersonate a suspended tenant" }, { status: 422 });
  }

  await createImpersonationToken({
    adminId: admin.id,
    adminEmail: admin.email,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
  });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: "ADMIN_IMPERSONATED_TENANT",
    description: `Admin started impersonating tenant "${tenant.name}" (${tenant.slug})`,
    tenantId: tenant.id,
    metadata: { tenantSlug: tenant.slug },
  });

  return NextResponse.json({
    message: "Impersonation started",
    redirectTo: `/t/${tenant.slug}/dashboard`,
  });
}

/** DELETE /api/admin/tenants/[id]/impersonate — end impersonation */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await clearImpersonationToken();

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: "IMPERSONATION_ENDED",
    description: `Admin ended impersonation session for tenant ${params.id}`,
    tenantId: params.id,
  });

  return NextResponse.json({ message: "Impersonation ended", redirectTo: "/admin/tenants" });
}
