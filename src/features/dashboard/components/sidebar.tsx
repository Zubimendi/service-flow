"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  UserCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/services", label: "Services", icon: Scissors },
  { href: "/staff", label: "Staff", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  slug: string;
  tenantName: string;
}

function SidebarContent({ slug, tenantName, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed } = useUIStore();
  const base = `/t/${slug}/dashboard`;
  const collapsed = sidebarCollapsed;

  return (
    <>
      <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-3")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          {tenantName.charAt(0)}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-sidebar-foreground-active">
              {tenantName}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
              ServiceFlow CRM
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const href = `${base}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-active text-sidebar-foreground-active"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-sidebar-foreground-active",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-sidebar-border p-4", collapsed && "px-2")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/30 text-xs text-white">
              {session?.user?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground-active">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">Admin Access</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar({ slug, tenantName }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } =
    useUIStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-col bg-sidebar transition-all duration-200 lg:flex",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent slug={slug} tenantName={tenantName} />
        <button
          onClick={toggleSidebar}
          className="mx-3 mb-4 flex h-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/5"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar transition-transform duration-200 lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-1.5 text-sidebar-foreground hover:bg-white/5"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent
          slug={slug}
          tenantName={tenantName}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </aside>
    </>
  );
}
