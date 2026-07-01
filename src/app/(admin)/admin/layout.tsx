import { requireAdmin } from '@/lib/admin/requireAdmin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real RBAC enforcement — redirects non-admins to /login
  const { user } = await requireAdmin();

  return (
    <div
      className="admin-root"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        backgroundColor: '#080811',
        overflow: 'hidden',
      }}
    >
      <AdminSidebar adminName={user.name} adminEmail={user.email} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <AdminTopBar adminName={user.name} adminEmail={user.email} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px',
            backgroundColor: '#080811',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
