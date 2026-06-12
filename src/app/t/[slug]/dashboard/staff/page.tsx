import { StaffAvailability } from "@/features/staff/components/staff-availability";

export default function StaffPage({ params }: { params: { slug: string } }) {
  return <StaffAvailability slug={params.slug} />;
}
