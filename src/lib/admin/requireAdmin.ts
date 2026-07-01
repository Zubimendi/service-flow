import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/types/auth";

/**
 * Server-side guard for all admin routes and server actions.
 * Throws a redirect to /login if the user is not a PLATFORM_ADMIN.
 * Returns the verified session on success.
 */
export async function requireAdmin(): Promise<{ user: SessionUser }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "PLATFORM_ADMIN") {
    // Redirect non-admins to their own dashboard or login
    redirect("/login");
  }

  return session as { user: SessionUser };
}

/**
 * API-route variant: returns null instead of redirecting.
 * Use in API route handlers where a redirect is not appropriate.
 */
export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    return null;
  }
  return session.user as SessionUser;
}
