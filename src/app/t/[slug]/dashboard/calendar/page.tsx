import { CalendarView } from "@/features/scheduling/components/calendar-view";

export default function CalendarPage({ params }: { params: { slug: string } }) {
  return <CalendarView slug={params.slug} />;
}
