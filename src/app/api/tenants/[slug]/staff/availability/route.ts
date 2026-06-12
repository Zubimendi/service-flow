import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { availabilitySchema } from "@/lib/validations/availability";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const availabilities = await withTenantContext(auth.tenant.id, (tx) =>
    tx.staffAvailability.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: [{ userId: "asc" }, { dayOfWeek: "asc" }],
    })
  );

  return NextResponse.json({ availabilities });
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const availability = await withTenantContext(auth.tenant.id, (tx) =>
    tx.staffAvailability.create({
      data: { tenantId: auth.tenant.id, ...parsed.data },
      include: { user: { select: { id: true, name: true } } },
    })
  );

  return NextResponse.json({ availability }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id required" }, { status: 400 });
  }

  await withTenantContext(auth.tenant.id, (tx) =>
    tx.staffAvailability.delete({ where: { id } })
  );

  return NextResponse.json({ success: true });
}
