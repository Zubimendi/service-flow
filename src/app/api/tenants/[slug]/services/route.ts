import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { serviceSchema } from "@/lib/validations/service";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const services = await withTenantContext(auth.tenant.id, (tx) =>
    tx.service.findMany({ orderBy: { name: "asc" } })
  );

  return NextResponse.json({ services });
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const service = await withTenantContext(auth.tenant.id, (tx) =>
    tx.service.create({
      data: { tenantId: auth.tenant.id, ...parsed.data },
    })
  );

  return NextResponse.json({ service }, { status: 201 });
}
