import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { Role } from "@prisma/client";

export async function resolveTenantApi(slug: string) {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    return { error: NextResponse.json({ message: "Tenant not found" }, { status: 404 }) };
  }
  if (tenant.status === "SUSPENDED") {
    return { error: NextResponse.json({ message: "Tenant suspended" }, { status: 403 }) };
  }
  return { tenant };
}

export async function requireTenantApi(
  slug: string,
  allowedRoles: Role[] = ["TENANT_OWNER", "STAFF", "PLATFORM_ADMIN"]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const { tenant, error } = await resolveTenantApi(slug);
  if (error) return { error };

  if (!allowedRoles.includes(session.user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  if (
    session.user.role !== "PLATFORM_ADMIN" &&
    session.user.tenantId !== tenant.id
  ) {
    return { error: NextResponse.json({ message: "Tenant mismatch" }, { status: 403 }) };
  }

  return { tenant, session };
}
