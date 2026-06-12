export function extractTenantSlug(hostname: string, pathname: string): string | null {
  const pathMatch = pathname.match(/^\/t\/([a-z0-9-]+)/);
  if (pathMatch) return pathMatch[1];

  const host = hostname.split(":")[0];
  const parts = host.split(".");

  if (parts.length >= 2 && parts[0] !== "www" && parts[0] !== "localhost") {
    const subdomain = parts[0];
    if (subdomain !== "app" && subdomain !== "admin") {
      return subdomain;
    }
  }

  return null;
}

export function tenantPath(slug: string, path: string): string {
  return `/t/${slug}${path.startsWith("/") ? path : `/${path}`}`;
}

export const PLATFORM_HOSTS = ["localhost", "app.localhost", "serviceflow.app"];
