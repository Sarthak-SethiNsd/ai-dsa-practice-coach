"use client";

import * as React from "react";
import {
  ReviewCollection,
  CollectionColor,
  CreateCollectionPayload,
} from "@/services/collectionTypes";
import { COLOR_PALETTE } from "@/services/questionCollectionAnalytics";
import { DEFAULT_COLLECTION_COLORS } from "@/services/reviewCollectionStorage";
import { X, Folder } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Shared form output — always has a non-empty name (validated before submit) */
export interface CollectionFormPayload {
  name: string;
  description?: string;
  color: CollectionColor;
}

interface CreateEditCollectionModalProps {
  /** If provided, we are editing an existing collection */
  existing?: ReviewCollection | null;
  onSubmit: (payload: CollectionFormPayload) => Promise<void>;
  onClose: () => void;
}

export function CreateEditCollectionModal({
  existing,
  onSubmit,
  onClose,
}: CreateEditCollectionModalProps) {
  const isEdit = Boolean(existing);

  const [name, setName] = React.useState(existing?.name ?? "");
  const [description, setDescription] = React.useState(existing?.description ?? "");
  const [color, setColor] = React.useState<CollectionColor>(existing?.color ?? "sky");
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string }>({});

  const validate = (): boolean => {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = "Collection name is required.";
    else if (name.trim().length > 80) errs.name = "Name must be 80 characters or fewer.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, color });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Trap focus inside modal
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isEdit ? "Edit Collection" : "New Collection"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Graph Algorithms, DP Patterns..."
              maxLength={80}
              className={`w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-shadow ${
                errors.name
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-slate-50 focus:bg-white"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 font-medium">{errors.name}</p>
            )}
            <p className="text-[11px] text-slate-400">{name.length}/80 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about what this collection covers..."
              rows={3}
              maxLength={300}
              className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-shadow resize-none"
            />
            <p className="text-[11px] text-slate-400">{description.length}/300 characters</p>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {DEFAULT_COLLECTION_COLORS.map((c) => {
                const pal = COLOR_PALETTE[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${pal.dot} ${
                      color === c
                        ? "border-slate-900 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    aria-label={c}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={submitting}>
              {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Changes" : "Create Collection"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
