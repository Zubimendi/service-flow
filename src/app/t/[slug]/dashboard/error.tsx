"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-h2 mb-2">Something went wrong</h2>
      <p className="text-caption mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
