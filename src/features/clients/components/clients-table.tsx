"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientDetailPanel } from "./client-detail-panel";

interface ClientsTableProps {
  slug: string;
}

export function ClientsTable({ slug }: ClientsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useClients(slug, search || undefined);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const clients = data?.clients ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Clients</h1>
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Search clients"
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients are added automatically when they book an appointment."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-right font-medium">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30"
                  onClick={() => setSelectedId(client.id)}
                >
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{client._count.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientDetailPanel
        slug={slug}
        clientId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
