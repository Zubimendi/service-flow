'use client';
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
