"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { primaryColor: "#3525cd" },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const result = await tenantsApi.signup(data);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      toast({ title: "Account created!", description: "Welcome to ServiceFlow.", variant: "success" });
      router.push(`/t/${result.slug}/dashboard`);
    } catch (e) {
      toast({
        title: "Signup failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light/40 via-background to-background" />
      <Card className="w-full max-w-lg border-border shadow-card-hover">
        <CardHeader className="space-y-3 pb-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            SF
          </div>
          <CardTitle className="text-headline-md">Create your business account</CardTitle>
          <CardDescription>Get your branded booking site in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <span className="shrink-0 text-body-md text-muted-foreground">.serviceflow.app</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" {...form.register("password")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand color</Label>
              <Input id="primaryColor" type="color" className="h-11 cursor-pointer p-1" {...form.register("primaryColor")} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          <p className="mt-5 text-center text-body-md text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
