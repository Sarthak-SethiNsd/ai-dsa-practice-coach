"use client";

import * as React from "react";
import { ReportPrivacySettings } from "@/services/progress/progressTypes";
import { Button } from "@/components/ui/Button";
import { Shield, Eye, EyeOff, X, Check, Lock } from "lucide-react";

interface ReportPrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReportPrivacySettings;
  onSave: (settings: Partial<ReportPrivacySettings>) => Promise<void>;
}

export function ReportPrivacySettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: ReportPrivacySettingsProps) {
  const [localSettings, setLocalSettings] = React.useState<ReportPrivacySettings>(settings);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizes local editable draft settings with parent settings prop
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof ReportPrivacySettings) => {
    if (key === "displayName") return;
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSettings);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const items: { key: keyof ReportPrivacySettings; label: string; desc: string }[] = [
    { key: "showRatings", label: "Contest Ratings", desc: "Display Codeforces & platform competitive ratings" },
    { key: "showContests", label: "Contest Performance", desc: "Include ranks, delta scores, and contest history" },
    { key: "showStudyTime", label: "Focus Study Time", desc: "Show logged hours and consistency metrics" },
    { key: "showTopicStats", label: "Topic & Domain Mastery", desc: "Include detailed per-topic mastery tiers and review scores" },
    { key: "showAchievements", label: "Earned Achievements", desc: "Display verified milestone badges in report & card" },
    { key: "showWeaknesses", label: "Mistake Categories", desc: "Include high-level mistake trends (private notes remain hidden)" },
    { key: "showAIInsights", label: "AI Progress Evaluation", desc: "Include AI summary and next recommended focus areas" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Report Privacy Controls</h3>
                <p className="text-xs text-slate-500">Configure what is visible in exported and shared reports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Always Protected Guarantee Banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium leading-relaxed">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Privacy Guarantee:</span> Private problem notes, source code, and raw AI chat logs are <strong>strictly excluded</strong> and never exposed in any shareable report or snapshot.
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Display Name on Reports</label>
              <input
                type="text"
                value={localSettings.displayName}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g. Alex Code or Anonymous Learner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
              />
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">Section Visibility</label>
              {items.map((item) => {
                const isEnabled = localSettings[item.key] as boolean;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggle(item.key)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isEnabled
                        ? "bg-sky-50/40 border-sky-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.label}</span>
                        {isEnabled ? (
                          <Eye className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                        isEnabled ? "bg-sky-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
            <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 cursor-pointer">
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : "Save Privacy Settings"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
