import { NextResponse } from "next/server";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { withBypassRls } from "@/lib/db/tenant-client";
import { computeAvailableSlots } from "@/lib/scheduling/slots";
import { BusinessHours } from "@/types/tenant";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = rateLimit(`slots:${params.slug}:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date");

  if (!serviceId || !dateStr) {
    return NextResponse.json({ message: "serviceId and date required" }, { status: 400 });
  }

  const tenant = await withBypassRls((tx) =>
    tx.tenant.findUnique({ where: { slug: params.slug } })
  );

  if (!tenant || tenant.status === "SUSPENDED") {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  const service = await withBypassRls((tx) =>
    tx.service.findFirst({
      where: { id: serviceId, tenantId: tenant.id, isActive: true },
    })
  );

  if (!service) {
    return NextResponse.json({ message: "Service not found" }, { status: 404 });
  }

  const date = parseISO(dateStr);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [availabilities, appointments] = await withBypassRls(async (tx) => {
    const avails = await tx.staffAvailability.findMany({
      where: {
        tenantId: tenant.id,
        userId: { in: service.assignedStaffIds },
      },
      include: { user: { select: { id: true, name: true } } },
    });
    const apts = await tx.appointment.findMany({
      where: {
        tenantId: tenant.id,
        staffId: { in: service.assignedStaffIds },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });
    return [avails, apts] as const;
  });

  const slots = computeAvailableSlots({
    date,
    serviceDurationMinutes: service.durationMinutes,
    assignedStaffIds: service.assignedStaffIds,
    availabilities,
    appointments,
    businessHours: tenant.businessHours as BusinessHours,
  });

  return NextResponse.json({ slots });
}
