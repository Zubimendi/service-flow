"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { primaryColor: "#4F46E5" },
  });

  const onSubmit = async (data: SignupInput) => {
    setError(null);
    try {
      const result = await tenantsApi.signup(data);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push(`/t/${result.slug}/dashboard`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="mb-2 text-lg font-bold text-primary">
            ServiceFlow
          </Link>
          <CardTitle>Create your business account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input id="businessName" {...form.register("businessName")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Subdomain slug</Label>
              <div className="flex items-center gap-2">
                <Input id="slug" placeholder="my-salon" {...form.register("slug")} />
                <span className="text-caption shrink-0">.serviceflow.app</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand color</Label>
              <Input id="primaryColor" type="color" {...form.register("primaryColor")} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-caption">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
