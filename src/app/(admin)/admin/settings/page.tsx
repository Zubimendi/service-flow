import { requireAdmin } from '@/lib/admin/requireAdmin';
import { adminDb } from '@/lib/admin/adminDb';
import SettingsClient from '@/components/admin/SettingsClient';

export default async function SettingsPage() {
  const { user } = await requireAdmin();

  const admins = await adminDb.user.findMany({
    where: { role: 'PLATFORM_ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
          Manage global settings, email servers, and platform administrators
        </p>
      </div>

      <SettingsClient admins={admins} currentAdminEmail={user.email} />
    </div>
  );
}
