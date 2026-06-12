import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const staff = await withTenantContext(auth.tenant.id, (tx) =>
    tx.user.findMany({
      where: { tenantId: auth.tenant.id, role: "STAFF" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    })
  );

  return NextResponse.json({ staff });
}
