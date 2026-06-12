import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { extractTenantSlug } from "@/lib/tenant/resolve";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "localhost";
  const tenantSlug = extractTenantSlug(hostname, pathname);

  const requestHeaders = new Headers(request.headers);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isDashboardPath =
    pathname.includes("/dashboard") ||
    (tenantSlug && pathname === "/dashboard");

  if (isDashboardPath) {
    const dashboardPath = pathname.includes("/t/")
      ? pathname
      : `/t/${tenantSlug}/dashboard${pathname.replace("/dashboard", "") || ""}`;

    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(dashboardPath)}`, request.url)
      );
    }

    if (
      token.role !== "PLATFORM_ADMIN" &&
      token.role !== "TENANT_OWNER" &&
      token.role !== "STAFF"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (
      tenantSlug &&
      token.role !== "PLATFORM_ADMIN" &&
      token.tenantSlug !== tenantSlug
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (tenantSlug && pathname === "/" && !pathname.startsWith("/api")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/t/${tenantSlug}`;
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  if (tenantSlug && pathname.startsWith("/dashboard")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/t/${tenantSlug}${pathname}`;
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
