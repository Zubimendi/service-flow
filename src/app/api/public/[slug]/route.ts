import { NextResponse } from "next/server";
import { withBypassRls } from "@/lib/db/tenant-client";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = rateLimit(`public:${params.slug}:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const tenant = await withBypassRls((tx) =>
    tx.tenant.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logoUrl: true,
        primaryColor: true,
        businessHours: true,
        timezone: true,
        status: true,
      },
    })
  );

  if (!tenant || tenant.status === "SUSPENDED") {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  const services = await withBypassRls((tx) =>
    tx.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        price: true,
      },
      orderBy: { name: "asc" },
    })
  );

  return NextResponse.json({ tenant, services });
}
