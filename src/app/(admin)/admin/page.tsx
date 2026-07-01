import { redirect } from 'next/navigation';

// Immediately redirect /admin → /admin/dashboard
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
