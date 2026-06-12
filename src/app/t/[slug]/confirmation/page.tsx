import { Suspense } from "react";
import { ConfirmationPage } from "@/features/booking/components/confirmation-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfirmationRoute({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-background px-6">
      <Suspense fallback={<Skeleton className="mx-auto mt-16 h-64 max-w-lg" />}>
        <ConfirmationPage slug={params.slug} />
      </Suspense>
    </div>
  );
}
