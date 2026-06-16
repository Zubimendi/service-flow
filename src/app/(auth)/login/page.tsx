import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light/40 via-background to-background" />
      <Suspense fallback={<Skeleton className="h-[520px] w-full max-w-md rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
