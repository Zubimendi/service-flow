import { NextResponse } from "next/server";
import { withBypassRls } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";
import { createConnectAccount, createConnectOnboardingLink } from "@/lib/stripe/connect";

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
    return NextResponse.json(
      { message: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local" },
      { status: 503 }
    );
  }

  let accountId = auth.tenant.stripeConnectAccountId;

  if (!accountId) {
    const account = await createConnectAccount(auth.session.user.email);
    accountId = account.id;
    await withBypassRls((tx) =>
      tx.tenant.update({
        where: { id: auth.tenant.id },
        data: { stripeConnectAccountId: accountId },
      })
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = await createConnectOnboardingLink(
    accountId,
    `${baseUrl}/t/${params.slug}/dashboard/settings?stripe=success`,
    `${baseUrl}/t/${params.slug}/dashboard/settings?stripe=refresh`
  );

  return NextResponse.json({ url: link.url });
}
