"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function TenantsTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: () =>
      api.get<{
        tenants: Array<{
          id: string;
          slug: string;
          name: string;
          status: string;
          subscriptionStatus: string;
          subscriptionPlan: string;
          _count: { users: number; appointments: number };
        }>;
      }>("/api/admin/tenants"),
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/admin/tenants/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] }),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const tenants = data?.tenants ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-h1">Platform Admin</h1>
      <p className="text-caption">Manage all tenants on the ServiceFlow platform.</p>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No tenants"
          description="Tenants will appear here when businesses sign up."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Business</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Users</th>
                <th className="px-4 py-3 text-right font-medium">Bookings</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-border">
                  <td className="px-4 py-3 font-medium">{tenant.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tenant.slug}</td>
                  <td className="px-4 py-3">{tenant.subscriptionPlan}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tenant.status === "ACTIVE" ? "confirmed" : "cancelled"}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{tenant._count.users}</td>
                  <td className="px-4 py-3 text-right">{tenant._count.appointments}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateTenant.mutate({
                          id: tenant.id,
                          status: tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                        })
                      }
                    >
                      {tenant.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
