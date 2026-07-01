import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { z } from "zod";

const updateSchema = z.object({
  enabled: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const existing = await adminDb.featureFlag.findFirst({
    where: { key: params.key, tenantId: null },
  });

  if (!existing) {
    return NextResponse.json({ message: "Flag not found" }, { status: 404 });
  }

  const flag = await adminDb.featureFlag.update({
    where: { id: existing.id },
    data: { enabled: parsed.data.enabled, updatedBy: admin.id },
  });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: "FEATURE_FLAG_GLOBAL_TOGGLED",
    description: `Global flag "${params.key}" ${parsed.data.enabled ? "enabled" : "disabled"}`,
    metadata: { key: params.key, enabled: parsed.data.enabled },
  });

  return NextResponse.json({ flag });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { key: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const existing = await adminDb.featureFlag.findFirst({
    where: { key: params.key, tenantId: null },
  });

  if (existing) {
    await adminDb.featureFlag.delete({
      where: { id: existing.id },
    });
  }

  return NextResponse.json({ message: "Flag deleted" });
}
