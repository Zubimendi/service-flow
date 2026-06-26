import os

base_dir = "/home/francisco4/Desktop/Kali Projects/service-flow"

files_to_create = {
    "src/types/admin.ts": """import { z } from 'zod';

export const UpdateTenantStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export const UpdateTenantPlanSchema = z.object({
  plan: z.enum(['FREE', 'STARTER', 'PRO']), // FREE maps to STARTER in enum if needed, wait schema uses STARTER/PRO/ENTERPRISE
});

export const ImpersonateSchema = z.object({
  tenantId: z.string(),
});

export const ToggleFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  tenantId: z.string().nullable().optional(),
});
""",
    "src/app/(admin)/admin/tenants/page.tsx": """import { Suspense } from 'react';
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
""",
    "src/components/admin/TenantTable/TenantTable.tsx": """'use client';
import { useState } from 'react';

// Using a simplified table for this example; ideally this would use @tanstack/react-table
export function TenantTable({ columns, data }: { columns: any, data: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-gray-200 flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Search tenants..." 
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Tenant</th>
            <th className="px-6 py-3">Plan</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Created</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(tenant => (
            <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{tenant.name}</div>
                <div className="text-gray-500 text-xs font-mono">{tenant.slug}</div>
              </td>
              <td className="px-6 py-4">{tenant.subscriptionPlan}</td>
              <td className="px-6 py-4">{tenant.status}</td>
              <td className="px-6 py-4">{new Date(tenant.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                <a href={`/admin/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
""",
    "src/components/admin/TenantTable/columns.tsx": """export const columns = []; // Placeholder for tanstack table columns
""",
    "src/app/(admin)/admin/tenants/[id]/page.tsx": """import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin/adminDb';

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const tenant = await adminDb.tenant.findUnique({
    where: { id: params.id },
    include: {
      users: true,
    }
  });

  if (!tenant) return notFound();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">{tenant.slug}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Impersonate</button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">Suspend</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Staff Members</h2>
            <ul className="space-y-3">
              {tenant.users.map(u => (
                <li key={u.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-gray-500">{u.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Subscription</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{tenant.subscriptionPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">{tenant.subscriptionStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-600 mb-4">Deleting this tenant is irreversible. All data will be removed.</p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete Tenant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
}

for path, content in files_to_create.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)

print("Created more files.")
