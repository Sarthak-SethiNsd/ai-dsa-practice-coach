"use client";

import * as React from "react";
import { CheckCircle2, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export function Toast() {
  const { toast, clearToast } = useAppContext();

  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show, clearToast]);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-sky-100 rounded-xl px-4.5 py-3 shadow-md select-none max-w-sm sm:max-w-md transition-all duration-300 transform translate-y-0">
      <div className="w-5.5 h-5.5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4.5 h-4.5" />
      </div>
      <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">
        {toast.message}
      </p>
      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Close alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
