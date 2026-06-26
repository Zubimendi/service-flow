import { notFound } from 'next/navigation';
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
