"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

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

export function Sidebar({ slug, tenantName }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const base = `/t/${slug}/dashboard`;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {tenantName.charAt(0)}
            </div>
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {tenantName}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
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
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-accent",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!sidebarCollapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "default"}
          onClick={toggleSidebar}
          className={cn("w-full", sidebarCollapsed && "w-10")}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
