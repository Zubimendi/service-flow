import { BookingFlow } from "@/features/booking/components/booking-flow";
import { getTenantBySlug } from "@/lib/db/tenant-client";
import { notFound } from "next/navigation";

export default async function BookPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-h1">{tenant.name}</h1>
          <p className="text-caption">Book your appointment</p>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <BookingFlow slug={params.slug} />
      </main>
    </div>
  );
}
