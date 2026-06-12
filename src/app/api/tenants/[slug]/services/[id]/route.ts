import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { serviceSchema } from "@/lib/validations/service";

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const service = await withTenantContext(auth.tenant.id, (tx) =>
    tx.service.update({
      where: { id: params.id },
      data: parsed.data,
    })
  );

  return NextResponse.json({ service });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  await withTenantContext(auth.tenant.id, (tx) =>
    tx.service.update({
      where: { id: params.id },
      data: { isActive: false },
    })
  );

  return NextResponse.json({ success: true });
}
