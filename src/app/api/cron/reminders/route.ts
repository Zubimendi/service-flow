import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { withBypassRls } from "@/lib/db/tenant-client";
import { sendAppointmentReminder } from "@/lib/email/resend";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = addHours(now, 23);
  const windowEnd = addHours(now, 25);

  const appointments = await withBypassRls((tx) =>
    tx.appointment.findMany({
      where: {
        startTime: { gte: windowStart, lte: windowEnd },
        reminderSentAt: null,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        client: true,
        service: true,
        tenant: true,
      },
      take: 100,
    })
  );

  let sent = 0;
  for (const apt of appointments) {
    try {
      await sendAppointmentReminder({
        to: apt.client.email,
        clientName: apt.client.name,
        tenantName: apt.tenant.name,
        serviceName: apt.service.name,
        startTime: apt.startTime,
      });

      await withBypassRls((tx) =>
        tx.appointment.update({
          where: { id: apt.id },
          data: { reminderSentAt: new Date() },
        })
      );
      sent++;
    } catch (error) {
      console.error(`Failed to send reminder for ${apt.id}:`, error);
    }
  }

  return NextResponse.json({ processed: appointments.length, sent });
}
