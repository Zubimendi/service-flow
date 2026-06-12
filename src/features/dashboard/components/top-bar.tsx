"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";

export function TopBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search... (⌘K)"
          className="pl-9"
          aria-label="Global search"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <div className="ml-2 flex items-center gap-2 border-l border-border pl-4">
          <span className="text-sm text-muted-foreground">
            {session?.user?.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
