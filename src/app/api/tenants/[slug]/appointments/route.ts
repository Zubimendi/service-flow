import { NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ message: "start and end required" }, { status: 400 });
  }

  const appointments = await withTenantContext(auth.tenant.id, (tx) =>
    tx.appointment.findMany({
      where: {
        startTime: { gte: parseISO(start), lte: parseISO(end) },
      },
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { startTime: "asc" },
    })
  );

  return NextResponse.json({ appointments });
}
