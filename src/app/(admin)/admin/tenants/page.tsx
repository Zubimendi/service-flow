import { Suspense } from 'react';
import { adminDb } from '@/lib/admin/adminDb';
import { TenantTable } from '@/components/admin/TenantTable/TenantTable';
import { columns } from '@/components/admin/TenantTable/columns';

export default async function AdminTenantsPage() {
  const tenants = await adminDb.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { appointments: true, users: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform tenants, suspend accounts, and view usage.</p>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading tenants...</div>}>
          <TenantTable columns={columns} data={tenants} />
        </Suspense>
      </div>
    </div>
  );
}
