import { ClientsTable } from "@/features/clients/components/clients-table";

export default function ClientsPage({ params }: { params: { slug: string } }) {
  return <ClientsTable slug={params.slug} />;
}
