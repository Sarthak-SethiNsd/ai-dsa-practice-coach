import * as React from "react";
import { Menu, Bell, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/25">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            DSA AI Coach
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-slate-500 hover:text-slate-900 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 border border-white" />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200/80 my-auto" />

        {/* User Avatar Placeholder */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sky-600 text-sm overflow-hidden select-none">
            JD
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-slate-700">
            John Doe
          </span>
        </div>
      </div>
    </header>
  );
}
