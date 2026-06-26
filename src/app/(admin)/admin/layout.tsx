import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
// Assuming we have a way to check auth here (e.g., token decoding)
// import { requireAdmin } from '@/lib/admin/requireAdmin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await requireAdmin(); // Validate server-side role
  
  return (
    <div className="flex h-screen w-full bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
