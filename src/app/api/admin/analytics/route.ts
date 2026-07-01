import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { z } from "zod";

const querySchema = z.object({
  range: z.enum(["30d", "90d", "1y"]).default("30d"),
});

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const { range } = querySchema.parse({ range: searchParams.get("range") ?? "30d" });

  const daysMap = { "30d": 30, "90d": 90, "1y": 365 };
  const days = daysMap[range];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build time-series: group tenants by creation date
  const tenants = await adminDb.tenant.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, subscriptionPlan: true, subscriptionStatus: true },
    orderBy: { createdAt: "asc" },
  });

  // Group bookings by date
  const appointments = await adminDb.appointment.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group payments by date
  const payments = await adminDb.payment.findMany({
    where: { createdAt: { gte: since }, status: "PAID" },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: "asc" },
  });

  // Build daily buckets
  const buckets: Record<string, { date: string; tenants: number; bookings: number; revenue: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    buckets[key] = { date: key, tenants: 0, bookings: 0, revenue: 0 };
  }

  for (const t of tenants) {
    const key = t.createdAt.toISOString().split("T")[0];
    if (buckets[key]) buckets[key].tenants++;
  }
  for (const a of appointments) {
    const key = a.createdAt.toISOString().split("T")[0];
    if (buckets[key]) buckets[key].bookings++;
  }
  for (const p of payments) {
    const key = p.createdAt.toISOString().split("T")[0];
    if (buckets[key]) buckets[key].revenue += p.amount;
  }

  return NextResponse.json({ data: Object.values(buckets), range });
}
