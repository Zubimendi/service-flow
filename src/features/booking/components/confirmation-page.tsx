"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConfirmationPageProps {
  slug: string;
}

export function ConfirmationPage({ slug }: ConfirmationPageProps) {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const icsUrl = appointmentId
    ? `/api/public/${slug}/calendar.ics?appointmentId=${appointmentId}`
    : "#";

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
      </div>
      <h1 className="text-h1 mb-2">You&apos;re all set!</h1>
      <p className="text-body text-muted-foreground mb-8">
        Your appointment has been confirmed. A confirmation email is on its way.
      </p>

      <Card className="mb-8">
        <CardContent className="p-6">
          <p className="text-caption mb-4">Add to your calendar</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild>
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="h-4 w-4" />
                Google Calendar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={icsUrl} download="appointment.ics">
                <Calendar className="h-4 w-4" />
                Apple / Outlook (.ics)
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" asChild>
        <Link href={`/t/${slug}`}>Book another appointment</Link>
      </Button>
    </div>
  );
}
