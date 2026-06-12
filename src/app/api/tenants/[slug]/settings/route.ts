import { NextResponse } from "next/server";
import { z } from "zod";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";

const settingsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  businessHours: z.record(
    z.string(),
    z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean().optional(),
    })
  ).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  return NextResponse.json({ tenant: auth.tenant });
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const auth = await requireTenantApi(params.slug, ["TENANT_OWNER"]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const tenant = await withTenantContext(auth.tenant.id, (tx) =>
    tx.tenant.update({
      where: { id: auth.tenant.id },
      data: parsed.data,
    })
  );

  return NextResponse.json({ tenant });
}
