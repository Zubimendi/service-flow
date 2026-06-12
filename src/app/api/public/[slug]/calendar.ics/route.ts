import { NextResponse } from "next/server";
import { format } from "date-fns";
import { withBypassRls } from "@/lib/db/tenant-client";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get("appointmentId");

  if (!appointmentId) {
    return NextResponse.json({ message: "appointmentId required" }, { status: 400 });
  }

  const appointment = await withBypassRls((tx) =>
    tx.appointment.findFirst({
      where: { id: appointmentId },
      include: { service: true, tenant: true, client: true },
    })
  );

  if (!appointment || appointment.tenant.slug !== params.slug) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const formatIcs = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ServiceFlow//EN",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@serviceflow.app`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(appointment.startTime)}`,
    `DTEND:${formatIcs(appointment.endTime)}`,
    `SUMMARY:${appointment.service.name} at ${appointment.tenant.name}`,
    `DESCRIPTION:Appointment with ${appointment.tenant.name}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": 'attachment; filename="appointment.ics"',
    },
  });
}
