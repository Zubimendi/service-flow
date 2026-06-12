import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withBypassRls } from "@/lib/db/tenant-client";
import { signupSchema } from "@/lib/validations/auth";
import { getDefaultBusinessHours } from "@/lib/scheduling/slots";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await withBypassRls((tx) =>
      tx.tenant.findUnique({ where: { slug: data.slug } })
    );
    if (existing) {
      return NextResponse.json({ message: "Slug already taken" }, { status: 409 });
    }

    const existingUser = await withBypassRls((tx) =>
      tx.user.findUnique({ where: { email: data.email } })
    );
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    let stripeCustomerId: string | undefined;
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.businessName,
        metadata: { slug: data.slug },
      });
      stripeCustomerId = customer.id;
    }

    const result = await withBypassRls(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: data.slug,
          name: data.businessName,
          primaryColor: data.primaryColor ?? "#4F46E5",
          businessHours: getDefaultBusinessHours(),
          timezone: data.timezone ?? "America/New_York",
          stripeCustomerId,
        },
      });

      await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: "TENANT_OWNER",
          tenantId: tenant.id,
        },
      });

      return tenant;
    });

    return NextResponse.json({ tenantId: result.id, slug: result.slug }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
