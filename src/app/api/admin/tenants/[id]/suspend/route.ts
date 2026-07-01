import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { adminDb } from "@/lib/admin/adminDb";

/** POST: Toggle tenant status between ACTIVE and SUSPENDED */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const tenant = await adminDb.tenant.findUnique({
    where: { id: params.id },
    select: { status: true, name: true },
  });
  if (!tenant) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

  const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const updated = await adminDb.tenant.update({
    where: { id: params.id },
    data: { status: newStatus },
  });

  await writeAuditLog({
    actorId: admin.id,
    actorEmail: admin.email,
    eventType: newStatus === "SUSPENDED" ? "TENANT_SUSPENDED" : "TENANT_ACTIVATED",
    description: `Tenant "${tenant.name}" ${newStatus === "SUSPENDED" ? "suspended" : "reactivated"}`,
    tenantId: params.id,
    metadata: { previousStatus: tenant.status, newStatus },
  });

  return NextResponse.json({ tenant: updated });
}
