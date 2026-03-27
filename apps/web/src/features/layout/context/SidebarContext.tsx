"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useCallback } from "react";

type SidebarContextValue = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (isMobile) {
      setIsMobileOpen((current) => !current);
      return;
    }
    setIsCollapsed((current) => !current);
  }, []);

  const value = useMemo<SidebarContextValue>(
    () => ({ isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar }),
    [isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
