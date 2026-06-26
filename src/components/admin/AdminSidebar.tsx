import Link from 'next/link';
import { Shield, LayoutDashboard, Users, CreditCard, Flag, FileText } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Shield className="w-6 h-6 text-indigo-400 mr-2" />
        <span className="text-white font-semibold tracking-wide">ServiceFlow Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/admin/dashboard" className="flex items-center px-6 py-2.5 hover:bg-slate-800 hover:text-white transition-colors group">
              <LayoutDashboard className="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/tenants" className="flex items-center px-6 py-2.5 hover:bg-slate-800 hover:text-white transition-colors group">
              <Users className="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" />
              Tenants
            </Link>
          </li>
          <li>
            <Link href="/admin/subscriptions" className="flex items-center px-6 py-2.5 hover:bg-slate-800 hover:text-white transition-colors group">
              <CreditCard className="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" />
              Subscriptions
            </Link>
          </li>
          <li>
            <Link href="/admin/feature-flags" className="flex items-center px-6 py-2.5 hover:bg-slate-800 hover:text-white transition-colors group">
              <Flag className="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" />
              Feature Flags
            </Link>
          </li>
          <li>
            <Link href="/admin/audit-log" className="flex items-center px-6 py-2.5 hover:bg-slate-800 hover:text-white transition-colors group">
              <FileText className="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" />
              Audit Log
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
