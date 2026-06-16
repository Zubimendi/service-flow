"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

function getRedirectUrl(
  callbackUrl: string,
  session: { user?: { role?: string; tenantSlug?: string | null } } | null
): string {
  if (callbackUrl && callbackUrl !== "/" && !callbackUrl.endsWith("/login")) {
    return callbackUrl;
  }
  const role = session?.user?.role;
  const slug = session?.user?.tenantSlug;
  if (role === "PLATFORM_ADMIN") return "/admin";
  if (slug) return `/t/${slug}/dashboard`;
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "owner@glow-salon.com", password: "password123" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Check your credentials and try again.",
          variant: "error",
        });
        return;
      }

      const session = await getSession();
      const redirectTo = getRedirectUrl(callbackUrl, session);
      toast({ title: "Welcome back!", variant: "success" });
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not connect to the server. Is the database running?",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border shadow-card-hover">
      <CardHeader className="space-y-3 pb-2 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            SF
          </div>
        </Link>
        <CardTitle className="text-headline-md">Sign in to ServiceFlow</CardTitle>
        <CardDescription>Manage your bookings, clients, and schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-surface-low p-4">
          <p className="text-label-md mb-2 text-muted-foreground normal-case tracking-normal font-medium">
            Demo credentials
          </p>
          <p className="text-body-md text-muted-foreground">
            <span className="font-medium text-foreground">owner@glow-salon.com</span>
            <br />
            Password: <span className="font-mono">password123</span>
          </p>
        </div>

        <p className="mt-5 text-center text-body-md text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create one free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
