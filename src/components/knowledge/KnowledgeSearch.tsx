"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

interface KnowledgeSearchProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export function KnowledgeSearch({ value, onChange, placeholder = "Search notes, insights, tags..." }: KnowledgeSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-300 bg-white transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
