import { Suspense } from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your multi-tenant SaaS</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placeholder Stat Cards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Active Tenants</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Bookings This Month</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">45,210</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Platform MRR</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">$24,500</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Payment Volume</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">$1.2M</p>
        </div>
      </div>
    </div>
  );
}
