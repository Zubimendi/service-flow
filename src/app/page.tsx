import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-bold text-primary">ServiceFlow</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-display mb-6 max-w-3xl mx-auto text-4xl md:text-5xl">
            Booking & CRM for local service businesses
          </h1>
          <p className="text-body mx-auto mb-8 max-w-2xl text-muted-foreground">
            Give your salon, gym, or studio a branded booking site, staff scheduling,
            client CRM, and payment processing — all in one platform.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/t/glow-salon">View demo</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <Calendar className="mb-4 h-8 w-8 text-primary" />
                <h3 className="text-h2 mb-2">Smart Scheduling</h3>
                <p className="text-caption">
                  Staff availability, conflict prevention, and a beautiful booking flow for your customers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Users className="mb-4 h-8 w-8 text-primary" />
                <h3 className="text-h2 mb-2">Client CRM</h3>
                <p className="text-caption">
                  Track every client, their booking history, and notes — all in one searchable dashboard.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <CreditCard className="mb-4 h-8 w-8 text-primary" />
                <h3 className="text-h2 mb-2">Built-in Payments</h3>
                <p className="text-caption">
                  Collect deposits via Stripe Connect. Get paid directly to your bank account.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
