"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tenantsApi } from "@/lib/api/tenants";

interface SettingsFormProps {
  slug: string;
}

export function SettingsForm({ slug }: SettingsFormProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settings", slug],
    queryFn: () => api.get<{ tenant: Record<string, unknown> }>(`/api/tenants/${slug}/settings`),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      api.patch(`/api/tenants/${slug}/settings`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", slug] }),
  });

  const connectStripe = useMutation({
    mutationFn: () => tenantsApi.connectStripe(slug),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      primaryColor: "#4F46E5",
      logoUrl: "",
      timezone: "America/New_York",
    },
  });

  useEffect(() => {
    if (data?.tenant) {
      const t = data.tenant;
      form.reset({
        name: String(t.name ?? ""),
        description: String(t.description ?? ""),
        primaryColor: String(t.primaryColor ?? "#4F46E5"),
        logoUrl: String(t.logoUrl ?? ""),
        timezone: String(t.timezone ?? "America/New_York"),
      });
    }
  }, [data, form]);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-h1">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Brand Color</Label>
                <Input id="primaryColor" type="color" {...form.register("primaryColor")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" {...form.register("logoUrl")} placeholder="https://..." />
              </div>
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-caption mb-4">
            Connect your Stripe account to accept deposits from customers.
          </p>
          <Button
            onClick={() => connectStripe.mutate()}
            disabled={connectStripe.isPending}
          >
            {data?.tenant?.stripeConnectAccountId
              ? "Manage Stripe Connect"
              : "Connect Stripe"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Link</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block rounded-lg bg-muted p-3 text-sm">
            {typeof window !== "undefined"
              ? `${window.location.origin}/t/${slug}`
              : `/t/${slug}`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
