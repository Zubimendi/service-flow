import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
              SF
            </div>
            <span className="text-lg font-bold">ServiceFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light/50 via-background to-background" />
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Built for local service businesses
            </div>
            <h1 className="text-headline-lg md:text-[48px] md:leading-[1.1]">
              Booking & CRM for salons, studios, and more
            </h1>
            <p className="mt-6 text-body-lg text-muted-foreground">
              Branded booking site, staff scheduling, client CRM, and Stripe payments —
              everything your business needs in one calm, powerful platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/t/glow-salon">View live demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Staff availability, conflict prevention, and a beautiful booking flow.",
              },
              {
                icon: Users,
                title: "Client CRM",
                desc: "Track every client, their history, and notes in one searchable dashboard.",
              },
              {
                icon: CreditCard,
                title: "Built-in Payments",
                desc: "Collect deposits via Stripe Connect. Get paid directly to your bank.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-card-hover">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-headline-sm mb-2">{title}</h3>
                  <p className="text-body-md text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
