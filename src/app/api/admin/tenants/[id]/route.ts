import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { adminDb } from "@/lib/admin/adminDb";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  subscriptionStatus: z.enum(["ACTIVE", "PAST_DUE", "CANCELLED", "TRIALING", "INCOMPLETE"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const tenant = await adminDb.tenant.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ tenant });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const tenant = await adminDb.tenant.findUnique({
    where: { id: params.id },
    select: { name: true, slug: true },
  });
  if (!tenant) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

  // Cascade delete is handled by the DB (onDelete: Cascade in schema)
  await adminDb.tenant.delete({ where: { id: params.id } });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: "TENANT_DELETED",
    description: `Tenant "${tenant.name}" (${tenant.slug}) permanently deleted`,
    tenantId: params.id,
    metadata: { tenantName: tenant.name, tenantSlug: tenant.slug },
  });

  return NextResponse.json({ message: "Tenant deleted" });
}
