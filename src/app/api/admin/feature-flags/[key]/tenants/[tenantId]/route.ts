import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { z } from "zod";

const schema = z.object({ enabled: z.boolean() });

/** Set a per-tenant override for a feature flag */
export async function PUT(
  request: Request,
  { params }: { params: { key: string; tenantId: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid input" }, { status: 400 });

  const flag = await adminDb.featureFlag.upsert({
    where: { key_tenantId: { key: params.key, tenantId: params.tenantId } },
    update: { enabled: parsed.data.enabled, updatedBy: admin.id },
    create: {
      key: params.key,
      name: `Override: ${params.key}`,
      tenantId: params.tenantId,
      enabled: parsed.data.enabled,
      updatedBy: admin.id,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: "FEATURE_FLAG_TOGGLED",
    description: `Per-tenant flag "${params.key}" set to ${parsed.data.enabled} for tenant ${params.tenantId}`,
    tenantId: params.tenantId,
    metadata: { key: params.key, enabled: parsed.data.enabled },
  });

  return NextResponse.json({ flag });
}

/** Remove a per-tenant override (reverts to global) */
export async function DELETE(
  _request: Request,
  { params }: { params: { key: string; tenantId: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    await adminDb.featureFlag.delete({
      where: { key_tenantId: { key: params.key, tenantId: params.tenantId } },
    });
  } catch {
    return NextResponse.json({ message: "Override not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Override removed" });
}
