import Link from "next/link";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { withBypassRls } from "@/lib/db/tenant-client";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Clock } from "lucide-react";

export default async function PublicBookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  const services = await withBypassRls((tx) =>
    tx.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { name: "asc" },
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="mx-auto mb-4 h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.name.charAt(0)}
            </div>
          )}
          <h1 className="text-h1 mb-2">{tenant.name}</h1>
          {tenant.description && (
            <p className="text-body mx-auto max-w-xl text-muted-foreground">
              {tenant.description}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-h2 mb-6">Our Services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <h3 className="font-semibold">{service.name}</h3>
                {service.description && (
                  <p className="text-caption mt-1">{service.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {service.durationMinutes} min
                  </span>
                  <span className="font-medium">{formatCurrency(service.price)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-tenant-primary hover:bg-tenant-primary/90"
          >
            <Link href={`/t/${params.slug}/book`}>Book an appointment</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
