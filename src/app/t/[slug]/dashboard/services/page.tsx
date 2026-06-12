import { ServicesManager } from "@/features/services/components/services-manager";

export default function ServicesPage({ params }: { params: { slug: string } }) {
  return <ServicesManager slug={params.slug} />;
}
