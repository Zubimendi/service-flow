import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? "bookings@serviceflow.app";

export async function sendBookingConfirmation(params: {
  to: string;
  clientName: string;
  tenantName: string;
  serviceName: string;
  startTime: Date;
  primaryColor: string;
}) {
  if (!resend) {
    console.log("[Email stub] Booking confirmation to", params.to);
    return;
  }

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Booking confirmed — ${params.tenantName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto;">
        <h1 style="color: ${params.primaryColor};">You're booked!</h1>
        <p>Hi ${params.clientName},</p>
        <p>Your appointment at <strong>${params.tenantName}</strong> is confirmed.</p>
        <p><strong>Service:</strong> ${params.serviceName}</p>
        <p><strong>When:</strong> ${params.startTime.toLocaleString("en-US")}</p>
      </div>
    `,
  });
}

export async function sendAppointmentReminder(params: {
  to: string;
  clientName: string;
  tenantName: string;
  serviceName: string;
  startTime: Date;
}) {
  if (!resend) {
    console.log("[Email stub] Reminder to", params.to);
    return;
  }

  await resend.emails.send({
    from,
    to: params.to,
    subject: `Reminder: appointment tomorrow — ${params.tenantName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto;">
        <h1>Appointment reminder</h1>
        <p>Hi ${params.clientName},</p>
        <p>This is a reminder about your upcoming appointment at <strong>${params.tenantName}</strong>.</p>
        <p><strong>Service:</strong> ${params.serviceName}</p>
        <p><strong>When:</strong> ${params.startTime.toLocaleString("en-US")}</p>
      </div>
    `,
  });
}
