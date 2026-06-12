import { TodayView } from "@/features/scheduling/components/today-view";

export default function DashboardPage({ params }: { params: { slug: string } }) {
  return <TodayView slug={params.slug} />;
}
