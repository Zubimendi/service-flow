import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { Role } from "@prisma/client";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireTenantAuth(tenantId: string, allowedRoles?: Role[]) {
  const session = await requireAuth(allowedRoles ?? ["TENANT_OWNER", "STAFF"]);
  if (session.user.role === "PLATFORM_ADMIN") return session;
  if (session.user.tenantId !== tenantId) {
    throw new Error("Tenant mismatch");
  }
  return session;
}
