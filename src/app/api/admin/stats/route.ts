import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    trialingTenants,
    newTenantsThisMonth,
    totalBookings,
    bookingsThisMonth,
    paymentsResult,
  ] = await Promise.all([
    adminDb.tenant.count(),
    adminDb.tenant.count({ where: { status: "ACTIVE", subscriptionStatus: { not: "TRIALING" } } }),
    adminDb.tenant.count({ where: { status: "SUSPENDED" } }),
    adminDb.tenant.count({ where: { subscriptionStatus: "TRIALING" } }),
    adminDb.tenant.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    adminDb.appointment.count(),
    adminDb.appointment.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    adminDb.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  // MRR estimate: count paid subs × plan price (rough platform-level)
  const planPriceMap: Record<string, number> = {
    STARTER: 2900,   // $29 in cents
    PRO: 7900,       // $79 in cents
    ENTERPRISE: 19900, // $199 in cents
  };

  const planCounts = await adminDb.tenant.groupBy({
    by: ["subscriptionPlan"],
    where: { subscriptionStatus: "ACTIVE" },
    _count: { id: true },
  });

  const mrrCents = planCounts.reduce((sum, group) => {
    const price = planPriceMap[group.subscriptionPlan] ?? 0;
    return sum + price * group._count.id;
  }, 0);

  return NextResponse.json({
    totalTenants,
    activeTenants,
    suspendedTenants,
    trialingTenants,
    newTenantsThisMonth,
    totalBookings,
    bookingsThisMonth,
    mrrCents,
    totalPaymentVolumeCents: paymentsResult._sum.amount ?? 0,
    planBreakdown: planCounts.map((p) => ({
      plan: p.subscriptionPlan,
      count: p._count.id,
    })),
  });
}
