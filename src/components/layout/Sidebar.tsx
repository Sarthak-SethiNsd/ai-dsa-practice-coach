"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Cpu,
  History,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Today's Practice", href: "/practice", icon: BookOpen },
    { name: "AI Review", href: "/review", icon: Cpu },
    { name: "History", href: "/history", icon: History },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const base = "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 select-none cursor-pointer";

    if (isActive) {
      return `${base} bg-sky-50 text-sky-700 shadow-sm border border-sky-100/40`;
    }
    return `${base} text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent`;
  };

  const desktopWidthClass = isCollapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col p-5 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 pl-1">
          <span className="text-lg font-bold text-slate-900">Navigation</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                href={item.href}
                onClick={isMobileOpen ? onMobileClose : undefined}
                className={getLinkClasses(item.href)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-100 bg-white sticky top-[69px] h-[calc(100vh-69px)] p-4 transition-all duration-300 ease-in-out shrink-0 select-none ${desktopWidthClass}`}
      >
        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                href={item.href}
                className={getLinkClasses(item.href)}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Collapse Button Footer */}
        <div className="pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full justify-start cursor-pointer px-3.5 py-3 text-slate-500 hover:text-slate-900"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Collapse Menu</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}