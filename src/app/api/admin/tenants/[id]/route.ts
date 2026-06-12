import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { withBypassRls } from "@/lib/db/tenant-client";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  subscriptionStatus: z.enum(["ACTIVE", "PAST_DUE", "CANCELLED", "TRIALING", "INCOMPLETE"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const tenant = await withBypassRls((tx) =>
    tx.tenant.update({
      where: { id: params.id },
      data: parsed.data,
    })
  );

  return NextResponse.json({ tenant });
}
