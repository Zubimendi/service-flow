import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { withBypassRls } from "@/lib/db/tenant-client";
import { sendBookingConfirmation } from "@/lib/email/resend";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const existing = await withBypassRls((tx) =>
    tx.stripeEvent.findUnique({ where: { eventId: event.id } })
  );
  if (existing) {
    return NextResponse.json({ received: true });
  }

  await withBypassRls((tx) =>
    tx.stripeEvent.create({
      data: { eventId: event.id, type: event.type },
    })
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;

    if (appointmentId) {
      const appointment = await withBypassRls((tx) =>
        tx.appointment.update({
          where: { id: appointmentId },
          data: { status: "CONFIRMED", paymentStatus: "PAID" },
          include: { client: true, service: true, tenant: true },
        })
      );

      await withBypassRls((tx) =>
        tx.payment.updateMany({
          where: { appointmentId },
          data: {
            status: "PAID",
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
          },
        })
      );

      await sendBookingConfirmation({
        to: appointment.client.email,
        clientName: appointment.client.name,
        tenantName: appointment.tenant.name,
        serviceName: appointment.service.name,
        startTime: appointment.startTime,
        primaryColor: appointment.tenant.primaryColor,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

    await withBypassRls((tx) =>
      tx.tenant.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus:
            subscription.status === "active"
              ? "ACTIVE"
              : subscription.status === "trialing"
                ? "TRIALING"
                : subscription.status === "past_due"
                  ? "PAST_DUE"
                  : "CANCELLED",
        },
      })
    );
  }

  return NextResponse.json({ received: true });
}
