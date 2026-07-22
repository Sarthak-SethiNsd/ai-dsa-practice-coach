"use client";

import * as React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAppContext } from "@/context/AppContext";
import { GlobalLoading } from "@/components/ui/GlobalLoading";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { loading } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Top Navbar */}
      <Navbar onMenuClick={() => setIsMobileOpen(true)} />
      {/* Global Loading Overlay */}
      {loading && <GlobalLoading />}

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Responsive Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Dynamic page content container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
