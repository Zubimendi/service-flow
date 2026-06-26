import { User } from 'lucide-react';

export default function AdminTopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center text-sm text-gray-500">
        <span>Admin</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Dashboard</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-gray-700">admin@serviceflow.app</div>
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
