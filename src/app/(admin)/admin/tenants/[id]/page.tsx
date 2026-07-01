import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin/adminDb';
import TenantDetailClient from '@/components/admin/TenantDetailClient';

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const tenant = await adminDb.tenant.findUnique({
    where: { id: params.id },
    include: {
      users: { orderBy: { createdAt: 'asc' } },
      _count: { select: { appointments: true, clients: true } },
    },
  });

  if (!tenant) return notFound();

  return <TenantDetailClient tenant={tenant as Parameters<typeof TenantDetailClient>[0]['tenant']} />;
}
