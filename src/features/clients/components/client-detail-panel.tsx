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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/utils";

interface ClientDetailPanelProps {
  slug: string;
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailPanel({ slug, clientId, onClose }: ClientDetailPanelProps) {
  const { data, isLoading } = useClient(slug, clientId);

  return (
    <SlideOver open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <SlideOverContent>
        <SlideOverHeader>
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <SlideOverTitle>{data?.client.name}</SlideOverTitle>
          )}
          <SlideOverCloseButton />
        </SlideOverHeader>
        <SlideOverBody>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32" />
            </div>
          ) : data?.client ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-caption">Contact</p>
                <p className="text-body">{data.client.email}</p>
                {data.client.phone && <p className="text-body">{data.client.phone}</p>}
              </div>
              {data.client.notes && (
                <div className="space-y-2">
                  <p className="text-caption">Notes</p>
                  <p className="text-body">{data.client.notes}</p>
                </div>
              )}
              <div className="space-y-3">
                <p className="text-caption">
                  Booking history ({data.client._count.appointments})
                </p>
                {data.client.appointments.length === 0 ? (
                  <p className="text-caption">No bookings yet</p>
                ) : (
                  data.client.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{apt.service.name}</p>
                        <p className="text-caption">
                          {formatDate(apt.startTime)} at {formatTime(apt.startTime)}
                        </p>
                      </div>
                      <Badge variant={apt.status === "CONFIRMED" ? "confirmed" : "pending"}>
                        {apt.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </SlideOverBody>
      </SlideOverContent>
    </SlideOver>
  );
}
