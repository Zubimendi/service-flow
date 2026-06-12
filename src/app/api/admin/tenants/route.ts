import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { withBypassRls } from "@/lib/db/tenant-client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const tenants = await withBypassRls((tx) =>
    tx.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true, appointments: true } },
      },
    })
  );

  return NextResponse.json({ tenants });
}
