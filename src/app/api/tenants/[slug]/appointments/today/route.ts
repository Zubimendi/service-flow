import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const { tenant } = auth;
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const appointments = await withTenantContext(tenant.id, (tx) =>
    tx.appointment.findMany({
      where: {
        startTime: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { startTime: "asc" },
    })
  );

  const bookingsCount = appointments.length;
  const expectedRevenue = appointments.reduce((sum, apt) => sum + apt.service.price, 0);

  const staffIds = Array.from(new Set(appointments.map((a) => a.staffId)));
  const totalSlots = staffIds.length * 8;
  const occupancyRate = totalSlots > 0 ? Math.round((bookingsCount / totalSlots) * 100) : 0;

  return NextResponse.json({
    appointments,
    stats: { bookingsCount, expectedRevenue, occupancyRate },
  });
}
