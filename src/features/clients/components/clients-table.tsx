"use client";

import { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const clients = data?.clients ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-lg">Clients</h1>
          <p className="mt-1 text-body-md text-muted-foreground">
            Manage your customer database and appointment history
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-low/60">
                  <th className="px-6 py-4 text-left text-label-md font-semibold normal-case tracking-normal text-muted-foreground">
                    Client Name
                  </th>
                  <th className="hidden px-6 py-4 text-left text-label-md font-semibold normal-case tracking-normal text-muted-foreground md:table-cell">
                    Email
                  </th>
                  <th className="hidden px-6 py-4 text-left text-label-md font-semibold normal-case tracking-normal text-muted-foreground lg:table-cell">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-center text-label-md font-semibold normal-case tracking-normal text-muted-foreground">
                    Visits
                  </th>
                  <th className="hidden px-6 py-4 text-right text-label-md font-semibold normal-case tracking-normal text-muted-foreground sm:table-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="cursor-pointer transition-colors hover:bg-surface-low/50"
                    onClick={() => setSelectedId(client.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                      {client.email}
                    </td>
                    <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                      {client.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="default">{client._count.appointments}</Badge>
                    </td>
                    <td className="hidden px-6 py-4 text-right sm:table-cell">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(client.id); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-body-md text-muted-foreground">
            <span>Showing {clients.length} clients</span>
          </div>
        </Card>
      )}

      <ClientDetailPanel
        slug={slug}
        clientId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
