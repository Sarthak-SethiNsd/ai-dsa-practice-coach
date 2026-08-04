"use client";

import * as React from "react";
import { PromptTemplate } from "@/services/promptTemplateTypes";
import { ChevronDown, Sparkles, Settings2, Check, Star } from "lucide-react";

interface TemplateSelectorProps {
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: PromptTemplate | null) => void;
  onOpenManagement: () => void;
  disabled?: boolean;
}

export function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onOpenManagement,
  disabled = false,
}: TemplateSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const selectedTemplate = React.useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) ?? null;
  }, [templates, selectedTemplateId]);

  const builtins = React.useMemo(() => templates.filter((t) => t.isBuiltin), [templates]);
  const customs = React.useMemo(() => templates.filter((t) => !t.isBuiltin), [templates]);

  return (
    <div ref={ref} className="relative inline-block text-left w-full sm:w-auto">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center justify-between gap-2 px-3 py-1.5 bg-white border rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm select-none w-full sm:w-auto ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
              : "hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50/50 cursor-pointer border-slate-200"
          }`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5 truncate max-w-[200px]">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">
              {selectedTemplate ? selectedTemplate.name : "Custom / No Template"}
            </span>
            {selectedTemplate?.isDefault && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
            )}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 mt-1.5 z-40 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 max-h-80 overflow-y-auto">
          {/* Custom / Clear Option */}
          <button
            type="button"
            onClick={() => {
              onSelectTemplate(null);
              setOpen(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors border-b border-slate-100"
          >
            <span>None (Custom Instruction)</span>
            {!selectedTemplateId && <Check className="w-3.5 h-3.5 text-sky-600 font-bold" />}
          </button>

          {/* Custom Templates Section */}
          {customs.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                My Templates
              </div>
              {customs.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tpl);
                      setOpen(false);
                    }}
                    className={`flex items-start justify-between w-full px-3 py-2 text-left hover:bg-sky-50 transition-colors ${
                      isSelected ? "bg-sky-50/80 font-bold text-sky-900" : "text-slate-700"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold truncate flex items-center gap-1">
                        <span>{tpl.name}</span>
                        {tpl.isDefault && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{tpl.description}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Built-in Templates Section */}
          <div className="py-1 border-t border-slate-100">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Built-in Templates
            </div>
            {builtins.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tpl);
                    setOpen(false);
                  }}
                  className={`flex items-start justify-between w-full px-3 py-2 text-left hover:bg-sky-50 transition-colors ${
                    isSelected ? "bg-sky-50/80 font-bold text-sky-900" : "text-slate-700"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate flex items-center gap-1">
                      <span>{tpl.name}</span>
                      {tpl.isDefault && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{tpl.description}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-slate-100 p-1 bg-slate-50/70">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenManagement();
              }}
              className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 hover:bg-sky-100/60 rounded-xl transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Manage Templates</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
