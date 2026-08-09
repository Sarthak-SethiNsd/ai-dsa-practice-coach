"use client";

import * as React from "react";
import { ReviewCollection } from "@/services/collectionTypes";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteCollectionModalProps {
  collection: ReviewCollection;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteCollectionModal({
  collection,
  onConfirm,
  onClose,
}: DeleteCollectionModalProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Delete Collection</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">&quot;{collection.name}&quot;</span>?
            This will remove the collection and all its question references.
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">
            The actual reviews in your History will not be deleted — only the collection grouping will be removed.
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete Collection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
