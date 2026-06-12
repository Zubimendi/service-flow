import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-6">
      <h1 className="text-h1 mb-2">Business not found</h1>
      <p className="text-caption mb-6">
        This booking page doesn&apos;t exist or has been suspended.
      </p>
      <Button asChild>
        <Link href="/">Go to ServiceFlow</Link>
      </Button>
    </div>
  );
}
