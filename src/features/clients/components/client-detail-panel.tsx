"use client";

import { useClient } from "@/hooks/use-clients";
import {
  SlideOver,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
  SlideOverBody,
  SlideOverCloseButton,
} from "@/components/ui/slide-over";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatTime } from "@/lib/utils";
import { Mail, Phone, Calendar } from "lucide-react";

interface ClientDetailPanelProps {
  slug: string;
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailPanel({ slug, clientId, onClose }: ClientDetailPanelProps) {
  const { data, isLoading } = useClient(slug, clientId);

  return (
    <SlideOver open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <SlideOverContent className="bg-card">
        <SlideOverHeader className="border-border">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <SlideOverTitle>Client Details</SlideOverTitle>
          )}
          <SlideOverCloseButton />
        </SlideOverHeader>
        <SlideOverBody>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : data?.client ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{data.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-headline-sm">{data.client.name}</h3>
                <p className="text-body-md text-muted-foreground">
                  {data.client._count.appointments} visits · Client
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-label-md text-muted-foreground normal-case tracking-normal font-medium">
                  Contact
                </p>
                <div className="space-y-2 rounded-xl bg-surface-low p-4">
                  <div className="flex items-center gap-3 text-body-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {data.client.email}
                  </div>
                  {data.client.phone && (
                    <div className="flex items-center gap-3 text-body-md">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {data.client.phone}
                    </div>
                  )}
                </div>
              </div>

              {data.client.notes && (
                <div className="space-y-2">
                  <p className="text-label-md text-muted-foreground normal-case tracking-normal font-medium">
                    Notes
                  </p>
                  <p className="rounded-xl bg-surface-low p-4 text-body-md">{data.client.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-label-md text-muted-foreground normal-case tracking-normal font-medium">
                  Recent Appointments
                </p>
                {data.client.appointments.length === 0 ? (
                  <p className="text-body-md text-muted-foreground">No bookings yet</p>
                ) : (
                  data.client.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{apt.service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(apt.startTime)} · {formatTime(apt.startTime)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={apt.status === "CONFIRMED" ? "confirmed" : "pending"}>
                        {apt.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </div>
          ) : null}
        </SlideOverBody>
      </SlideOverContent>
    </SlideOver>
  );
}
