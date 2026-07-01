import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const IMPERSONATION_COOKIE = "sf_impersonation";
const TTL_SECONDS = 60 * 60; // 1 hour

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface ImpersonationPayload {
  adminId: string;
  adminEmail: string;
  tenantId: string;
  tenantSlug: string;
}

/**
 * Creates a signed JWT impersonation token and sets it as an HttpOnly cookie.
 * The admin can then browse tenant routes as if they were the tenant owner.
 */
export async function createImpersonationToken(
  payload: ImpersonationPayload
): Promise<void> {
  const token = await new SignJWT({ ...payload, type: "impersonation" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TTL_SECONDS,
    path: "/",
  });
}

/**
 * Reads and validates the impersonation cookie.
 * Returns the payload if valid, null if missing or expired.
 */
export async function validateImpersonationToken(): Promise<ImpersonationPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(IMPERSONATION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "impersonation") return null;

    return {
      adminId: payload.adminId as string,
      adminEmail: payload.adminEmail as string,
      tenantId: payload.tenantId as string,
      tenantSlug: payload.tenantSlug as string,
    };
  } catch {
    return null;
  }
}

/**
 * Clears the impersonation cookie, ending the session.
 */
export async function clearImpersonationToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE);
}

/**
 * Check if the current request is an impersonation session (for middleware use).
 * Uses the raw cookie string since middleware can't use the `cookies()` helper.
 */
export async function validateImpersonationTokenFromString(
  tokenString: string
): Promise<ImpersonationPayload | null> {
  try {
    const { payload } = await jwtVerify(tokenString, getSecret());
    if (payload.type !== "impersonation") return null;
    return {
      adminId: payload.adminId as string,
      adminEmail: payload.adminEmail as string,
      tenantId: payload.tenantId as string,
      tenantSlug: payload.tenantSlug as string,
    };
  } catch {
    return null;
  }
}
