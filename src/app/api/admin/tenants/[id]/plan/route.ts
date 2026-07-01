import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { adminDb } from "@/lib/admin/adminDb";
import { z } from "zod";
import { AuditEventType } from "@prisma/client";

const schema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  subscriptionStatus: z.enum(["ACTIVE", "TRIALING", "PAST_DUE", "CANCELLED", "INCOMPLETE"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten() }, { status: 400 });
  }

  const previous = await adminDb.tenant.findUnique({
    where: { id: params.id },
    select: { subscriptionPlan: true, subscriptionStatus: true, name: true },
  });

  if (!previous) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

  const updated = await adminDb.tenant.update({
    where: { id: params.id },
    data: {
      subscriptionPlan: parsed.data.plan,
      ...(parsed.data.subscriptionStatus && { subscriptionStatus: parsed.data.subscriptionStatus }),
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: AuditEventType.TENANT_PLAN_CHANGED,
    description: `Plan changed for "${previous.name}": ${previous.subscriptionPlan} → ${parsed.data.plan}`,
    tenantId: params.id,
    metadata: {
      previousPlan: previous.subscriptionPlan,
      newPlan: parsed.data.plan,
      previousStatus: previous.subscriptionStatus,
      newStatus: parsed.data.subscriptionStatus,
    },
  });

  return NextResponse.json({ tenant: updated });
}
