import { NextResponse } from "next/server";
import { z } from "zod";
import { withTenantContext } from "@/lib/db/tenant-client";
import { requireTenantApi } from "@/lib/api/helpers";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  const auth = await requireTenantApi(params.slug);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const appointment = await withTenantContext(auth.tenant.id, (tx) =>
      tx.appointment.update({
        where: { id: params.id },
        data: parsed.data,
        include: {
          service: { select: { id: true, name: true, durationMinutes: true, price: true } },
          staff: { select: { id: true, name: true } },
          client: { select: { id: true, name: true, email: true, phone: true } },
        },
      })
    );

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ message: "Update failed" }, { status: 400 });
  }
}
