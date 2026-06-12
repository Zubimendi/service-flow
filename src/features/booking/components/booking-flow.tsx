"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { usePublicTenant } from "@/hooks/use-tenant";
import { useAvailableSlots } from "@/hooks/use-appointments";
import { bookingContactSchema, BookingContactInput } from "@/lib/validations/booking";
import { appointmentsApi } from "@/lib/api/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatTime } from "@/lib/utils";
import { TimeSlot } from "@/types/appointment";

type Step = "service" | "datetime" | "contact" | "payment";

interface BookingFlowProps {
  slug: string;
}

export function BookingFlow({ slug }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tenantData, isLoading } = usePublicTenant(slug);
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(
    slug,
    selectedServiceId ?? "",
    selectedDate
  );

  const contactForm = useForm<BookingContactInput>({
    resolver: zodResolver(bookingContactSchema),
  });

  const selectedService = tenantData?.services.find((s) => s.id === selectedServiceId);

  const handleBook = async (contact: BookingContactInput) => {
    if (!selectedServiceId || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      const result = await appointmentsApi.createBooking(slug, {
        serviceId: selectedServiceId,
        staffId: selectedSlot.staffId,
        startTime: selectedSlot.start,
        client: contact,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const tenant = tenantData?.tenant;
  const services = tenantData?.services ?? [];

  const calendarDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {step === "service" && (
          <div className="space-y-4">
            <h2 className="text-h2">Select a service</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer transition-shadow hover:shadow-card-hover"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setStep("datetime");
                  }}
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="text-caption mt-1">{service.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {service.durationMinutes} min
                      </span>
                      <span className="font-medium">{formatCurrency(service.price)}</span>
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "datetime" && selectedService && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep("service")}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <h2 className="text-h2">Pick a date & time</h2>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {calendarDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                    }}
                    className={`shrink-0 rounded-lg border px-4 py-3 text-center transition-colors ${
                      selectedDate === dateStr
                        ? "border-tenant-primary bg-tenant-primary/10 text-tenant-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                    <p className="font-medium">{format(day, "d")}</p>
                  </button>
                );
              })}
            </div>

            {slotsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(slotsData?.slots ?? []).length === 0 ? (
                  <p className="col-span-full text-caption">No available slots for this date.</p>
                ) : (
                  slotsData?.slots.map((slot) => (
                    <button
                      key={`${slot.start}-${slot.staffId}`}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("contact");
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedSlot?.start === slot.start
                          ? "border-tenant-primary bg-tenant-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {formatTime(slot.start)}
                      <span className="block text-[10px] text-muted-foreground">
                        {slot.staffName}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {step === "contact" && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep("datetime")}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <h2 className="text-h2">Your details</h2>
            <form
              onSubmit={contactForm.handleSubmit((data) => {
                setStep("payment");
                handleBook(data);
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...contactForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...contactForm.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...contactForm.register("phone")} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue to payment"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Booking summary</h3>
            {tenant && (
              <p className="text-caption">{tenant.name}</p>
            )}
            {selectedService && (
              <>
                <div className="border-t border-border pt-4">
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-caption">{selectedService.durationMinutes} minutes</p>
                  <p className="mt-2 font-medium">{formatCurrency(selectedService.price)}</p>
                </div>
                {selectedSlot && (
                  <div className="border-t border-border pt-4 text-sm">
                    <p>{format(new Date(selectedSlot.start), "EEEE, MMM d")}</p>
                    <p className="text-muted-foreground">
                      {formatTime(selectedSlot.start)} with {selectedSlot.staffName}
                    </p>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <p className="text-caption">Deposit (25%)</p>
                  <p className="font-medium">
                    {formatCurrency(Math.round(selectedService.price * 0.25))}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
