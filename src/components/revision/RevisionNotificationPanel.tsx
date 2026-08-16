"use client";

import * as React from "react";
import { RevisionNotification } from "@/services/revision/revisionTypes";
import { Bell, AlertTriangle, Flame, Info, X } from "lucide-react";

interface Props {
  notifications: RevisionNotification[];
  onDismiss: (id: string) => void;
}

const SEVERITY_CONFIG = {
  info: {
    bg: "bg-sky-50 border-sky-100",
    text: "text-sky-800",
    icon: Info,
    iconColor: "text-sky-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-100",
    text: "text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  error: {
    bg: "bg-rose-50 border-rose-100",
    text: "text-rose-800",
    icon: AlertTriangle,
    iconColor: "text-rose-500",
  },
  success: {
    bg: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-800",
    icon: Flame,
    iconColor: "text-emerald-500",
  },
};

export function RevisionNotificationPanel({ notifications, onDismiss }: Props) {
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-extrabold text-slate-900">
            SRS Revision Alerts
          </h3>
          {unreadNotifs.length > 0 && (
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-full">
              {unreadNotifs.length} new
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Architecture ready for Push & Email alerts
        </span>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center py-8 text-slate-400 text-sm">
          No active revision alerts.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const cfg = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info;
            const Icon = cfg.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${cfg.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                  <div className="space-y-0.5">
                    <h4 className={`text-sm font-extrabold ${cfg.text}`}>
                      {notif.title}
                    </h4>
                    <p className={`text-xs font-medium ${cfg.text} opacity-90`}>
                      {notif.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(notif.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
