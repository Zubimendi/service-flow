import { NextResponse } from "next/server";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { clientSchema } from "@/lib/validations/client";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const clients = await withTenantContext(auth.tenant.id, (tx) =>
    tx.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { _count: { select: { appointments: true } } },
      orderBy: { name: "asc" },
    })
  );

  return NextResponse.json({ clients });
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const client = await withTenantContext(auth.tenant.id, (tx) =>
    tx.client.create({
      data: { tenantId: auth.tenant.id, ...parsed.data },
      include: { _count: { select: { appointments: true } } },
    })
  );

  return NextResponse.json({ client }, { status: 201 });
}
