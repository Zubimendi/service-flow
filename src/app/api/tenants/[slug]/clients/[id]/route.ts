import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { clientSchema } from "@/lib/validations/client";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const client = await withTenantContext(auth.tenant.id, (tx) =>
    tx.client.findFirst({
      where: { id: params.id },
      include: {
        _count: { select: { appointments: true } },
        appointments: {
          orderBy: { startTime: "desc" },
          take: 20,
          include: { service: { select: { name: true } } },
        },
      },
    })
  );

  if (!client) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const client = await withTenantContext(auth.tenant.id, (tx) =>
    tx.client.update({
      where: { id: params.id },
      data: parsed.data,
      include: { _count: { select: { appointments: true } } },
    })
  );

  return NextResponse.json({ client });
}
