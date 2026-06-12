import { NextResponse } from "next/server";
import { addMinutes, parseISO } from "date-fns";
import { Prisma } from "@prisma/client";
import { withBypassRls } from "@/lib/db/tenant-client";
import { createBookingSchema } from "@/lib/validations/booking";
import { createBookingCheckoutSession } from "@/lib/stripe/connect";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = rateLimit(`book:${params.slug}:${ip}`);
  if (!limit.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const tenant = await withBypassRls((tx) =>
      tx.tenant.findUnique({ where: { slug: params.slug } })
    );

    if (!tenant || tenant.status === "SUSPENDED") {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const service = await withBypassRls((tx) =>
      tx.service.findFirst({
        where: { id: data.serviceId, tenantId: tenant.id, isActive: true },
      })
    );

    if (!service || !service.assignedStaffIds.includes(data.staffId)) {
      return NextResponse.json({ message: "Invalid service or staff" }, { status: 400 });
    }

    const startTime = parseISO(data.startTime);
    const endTime = addMinutes(startTime, service.durationMinutes);
    const depositAmount = Math.round(service.price * 0.25);

    const result = await withBypassRls(async (tx) => {
      const client = await tx.client.upsert({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: data.client.email,
          },
        },
        create: {
          tenantId: tenant.id,
          name: data.client.name,
          email: data.client.email,
          phone: data.client.phone,
          notes: data.client.notes,
        },
        update: {
          name: data.client.name,
          phone: data.client.phone,
          notes: data.client.notes,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          tenantId: tenant.id,
          serviceId: service.id,
          staffId: data.staffId,
          clientId: client.id,
          startTime,
          endTime,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      await tx.payment.create({
        data: {
          tenantId: tenant.id,
          appointmentId: appointment.id,
          amount: depositAmount,
          status: "PENDING",
        },
      });

      return { appointment, client, depositAmount };
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const successUrl = `${baseUrl}/t/${params.slug}/confirmation?appointmentId=${result.appointment.id}`;
    const cancelUrl = `${baseUrl}/t/${params.slug}`;

    if (
      tenant.stripeConnectAccountId &&
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("placeholder")
    ) {
      const session = await createBookingCheckoutSession({
        amount: result.depositAmount,
        connectedAccountId: tenant.stripeConnectAccountId,
        successUrl,
        cancelUrl,
        metadata: {
          appointmentId: result.appointment.id,
          tenantId: tenant.id,
        },
      });

      await withBypassRls((tx) =>
        tx.payment.updateMany({
          where: { appointmentId: result.appointment.id },
          data: { stripeSessionId: session.id },
        })
      );

      return NextResponse.json({
        appointmentId: result.appointment.id,
        checkoutUrl: session.url,
      });
    }

    await withBypassRls((tx) =>
      tx.appointment.update({
        where: { id: result.appointment.id },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      })
    );

    return NextResponse.json({
      appointmentId: result.appointment.id,
      checkoutUrl: successUrl,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ message: "Time slot no longer available" }, { status: 409 });
    }
    if (
      error instanceof Error &&
      error.message.includes("appointments_no_overlap")
    ) {
      return NextResponse.json({ message: "Time slot no longer available" }, { status: 409 });
    }
    console.error("Booking error:", error);
    return NextResponse.json({ message: "Booking failed" }, { status: 500 });
  }
}
