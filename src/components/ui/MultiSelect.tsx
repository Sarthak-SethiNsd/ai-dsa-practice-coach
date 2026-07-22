"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

// Single Select Component
interface SingleSelectProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
  placeholder?: string;
  optionToString?: (option: string) => string;
}

export function SearchableSingleSelect({
  options,
  selected,
  onChange,
  placeholder = "Select an option...",
  optionToString,
}: SingleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 cursor-pointer"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {!selected && placeholder ? (
            placeholder
          ) : (
            optionToString ? optionToString(selected) : selected
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-md">
          <div className="sticky top-0 bg-white pb-1.5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{optionToString ? optionToString(opt) : opt}</span>
                    {isSelected && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                );
              })
            ) : (
              <p className="py-3 text-center text-xs font-semibold text-slate-400">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Multi Select Component
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  optionToString?: (option: string) => string;
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select topics...",
  optionToString,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt)
  );

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter((item) => item !== opt));
  };

  return (
    <div className="relative w-full space-y-3" ref={containerRef}>
      {/* Dropdown trigger */}
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 cursor-pointer"
        >
          <span className="text-slate-400">{optionToString ? optionToString(placeholder) : placeholder}</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Selected Items Chips (Rounded chips with × icon) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50/50 border border-slate-100 rounded-xl">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-slate-300"
            >
              <span>{optionToString ? optionToString(item) : item}</span>
              <button
                type="button"
                onClick={() => removeOption(item)}
                className="hover:bg-slate-100 rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer flex items-center justify-center"
                aria-label={`Remove ${optionToString ? optionToString(item) : item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-md">
          <div className="sticky top-0 bg-white pb-1.5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    toggleOption(opt);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span>{optionToString ? optionToString(opt) : opt}</span>
                </button>
              ))
            ) : (
              <p className="py-3 text-center text-xs font-semibold text-slate-400">
                {search ? "No topics found." : "All topics selected!"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
