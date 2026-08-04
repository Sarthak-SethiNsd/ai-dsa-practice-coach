"use client";

import * as React from "react";
import { PromptTemplate } from "@/services/promptTemplateTypes";
import { usePromptTemplates } from "@/hooks/usePromptTemplates";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  Search,
  Plus,
  Star,
  Copy,
  Pencil,
  Trash2,
  Lock,
  Sparkles,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";

interface PromptTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndApply?: (template: PromptTemplate) => void;
  onError?: (message: string) => void;
}

export function PromptTemplateModal({
  isOpen,
  onClose,
  onSelectAndApply,
  onError,
}: PromptTemplateModalProps) {
  const {
    builtinTemplates,
    customTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate,
  } = usePromptTemplates();

  // Search & Filter state
  const [search, setSearch] = React.useState("");
  const [sortAlphabetical, setSortAlphabetical] = React.useState(false);

  // Form / Editor state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null); // null = new
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    prompt: "",
    isDefault: false,
  });

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  // Keyboard escape handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteConfirmId) {
          setDeleteConfirmId(null);
        } else if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isEditing, deleteConfirmId, onClose]);

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter & Sort logic
  const filterList = (list: PromptTemplate[]) => {
    let result = list;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.prompt.toLowerCase().includes(q)
      );
    }
    if (sortAlphabetical) {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  };

  const filteredBuiltins = filterList(builtinTemplates);
  const filteredCustoms = filterList(customTemplates);

  // Form Handlers
  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    setFormData({
      name: "",
      description: "",
      prompt: "",
      isDefault: false,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (template: PromptTemplate) => {
    if (template.isBuiltin) {
      onError?.("Built-in templates are read-only and cannot be edited.");
      return;
    }
    setEditingTemplateId(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      isDefault: template.isDefault,
    });
    setIsEditing(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.prompt.trim()) {
      onError?.("Name and Prompt instructions are required.");
      return;
    }

    try {
      if (editingTemplateId) {
        await updateTemplate(editingTemplateId, {
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          isDefault: formData.isDefault,
        });
      } else {
        await createTemplate({
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          isDefault: formData.isDefault,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error("[PromptTemplateModal] Save error:", err);
      onError?.("Failed to save template. Please try again.");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate(id);
    } catch (err) {
      console.error("[PromptTemplateModal] Duplicate error:", err);
      onError?.("Failed to duplicate template.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    try {
      const ok = await deleteTemplate(deleteConfirmId);
      if (!ok) {
        onError?.("Built-in templates cannot be deleted.");
      }
    } catch (err) {
      console.error("[PromptTemplateModal] Delete error:", err);
      onError?.("Failed to delete template.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggleDefault = async (template: PromptTemplate) => {
    try {
      await setDefaultTemplate(template.id);
    } catch (err) {
      console.error("[PromptTemplateModal] Set default error:", err);
      onError?.("Failed to update default template.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Prompt Templates</h2>
              <p className="text-xs text-slate-400">
                Manage custom instructions for Review AI evaluations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                className="gap-1.5 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> New Template
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* EDIT / CREATE FORM OVERLAY */}
          {isEditing ? (
            <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingTemplateId ? "Edit Custom Template" : "Create New Prompt Template"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Memory Optimization Focus"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Focuses on auxiliary space reduction and in-place tricks."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Prompt Instruction *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Write detailed instructions for the AI reviewer..."
                    className="w-full p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isDefaultCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Set as default template on page load
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Template
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSortAlphabetical((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    sortAlphabetical
                      ? "bg-sky-50 text-sky-700 border-sky-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortAlphabetical ? "Sorted A-Z" : "Default Order"}</span>
                </button>
              </div>

              {/* SECTION: CUSTOM TEMPLATES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span>Custom Templates</span>
                    <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                      {customTemplates.length}
                    </Badge>
                  </h3>
                </div>

                {filteredCustoms.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-medium">
                      {search ? "No custom templates match your search." : "No custom templates yet. Create your first custom template above!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredCustoms.map((template) => (
                      <TemplateItemCard
                        key={template.id}
                        template={template}
                        onEdit={() => handleOpenEdit(template)}
                        onDuplicate={() => handleDuplicate(template.id)}
                        onDelete={() => setDeleteConfirmId(template.id)}
                        onToggleDefault={() => handleToggleDefault(template)}
                        onSelectAndApply={onSelectAndApply ? () => {
                          onSelectAndApply(template);
                          onClose();
                        } : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: BUILT-IN TEMPLATES */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span>Built-in Templates</span>
                    <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                      {builtinTemplates.length}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-normal normal-case flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Read-only
                    </span>
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {filteredBuiltins.map((template) => (
                    <TemplateItemCard
                      key={template.id}
                      template={template}
                      onDuplicate={() => handleDuplicate(template.id)}
                      onToggleDefault={() => handleToggleDefault(template)}
                      onSelectAndApply={onSelectAndApply ? () => {
                        onSelectAndApply(template);
                        onClose();
                      } : undefined}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Inline Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Delete Template?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this custom template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirmed}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUB-COMPONENT: TEMPLATE ITEM CARD ──────────────────────────────────────────

interface TemplateItemCardProps {
  template: PromptTemplate;
  onEdit?: () => void;
  onDuplicate: () => void;
  onDelete?: () => void;
  onToggleDefault: () => void;
  onSelectAndApply?: () => void;
}

function TemplateItemCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleDefault,
  onSelectAndApply,
}: TemplateItemCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-800">{template.name}</h4>
            {template.isDefault && (
              <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> Default
              </Badge>
            )}
            {template.isBuiltin && (
              <Badge variant="neutral" className="text-[10px] px-1.5 py-0 text-slate-500">
                Built-in
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{template.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onSelectAndApply && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSelectAndApply}
              className="text-[11px] font-bold px-2 py-1 h-7 bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200"
            >
              Use
            </Button>
          )}

          <button
            type="button"
            onClick={onToggleDefault}
            title={template.isDefault ? "Currently Default" : "Set as Default"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              template.isDefault
                ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                : "text-slate-400 hover:text-amber-500 hover:bg-slate-50"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${template.isDefault ? "fill-amber-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate template"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {!template.isBuiltin && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit template"
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {!template.isBuiltin && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete template"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Prompt Text View */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-[10px] font-bold text-sky-600 hover:text-sky-800 transition-colors"
        >
          {expanded ? "Hide Prompt Text" : "View Prompt Text"}
        </button>

        {expanded && (
          <div className="mt-1.5 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {template.prompt}
          </div>
        )}
      </div>
    </div>
  );
}
