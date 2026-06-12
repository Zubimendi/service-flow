import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  activeTenantSlug: string | null;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTenantSlug: (slug: string | null) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeTenantSlug: null,
      theme: "system",
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveTenantSlug: (slug) => set({ activeTenantSlug: slug }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "serviceflow-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
