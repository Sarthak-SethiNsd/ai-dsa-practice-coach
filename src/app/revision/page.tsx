"use client";

import * as React from "react";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { RevisionDashboardHeader } from "@/components/revision/RevisionDashboardHeader";
import { DueRevisionList } from "@/components/revision/DueRevisionList";
import { RevisionWorkspaceModal } from "@/components/revision/RevisionWorkspaceModal";
import { TopicRetentionPanel } from "@/components/revision/TopicRetentionPanel";
import { RevisionCalendar } from "@/components/revision/RevisionCalendar";
import { AiRevisionCoachPanel } from "@/components/revision/AiRevisionCoachPanel";
import { RevisionNotificationPanel } from "@/components/revision/RevisionNotificationPanel";
import { RevisionItem } from "@/services/revision/revisionTypes";
import { useAppContext } from "@/context/AppContext";
import {
  RotateCcw,
  Clock,
  Calendar as CalendarIcon,
  Brain,
  Bot,
  Bell,
  RotateCw,
  Loader2,
} from "lucide-react";

type RevisionTab = "overview" | "workspace" | "calendar" | "topics" | "coach" | "notifications";

const TABS: { id: RevisionTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview Queue", icon: Clock },
  { id: "calendar", label: "Monthly Calendar", icon: CalendarIcon },
  { id: "topics", label: "Topic Retention", icon: Brain },
  { id: "coach", label: "AI Coach", icon: Bot },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function RevisionPage() {
  const { showToast } = useAppContext();
  const {
    data,
    loading,
    markRemembered,
    markForgotten,
    dismissNotification,
    refresh,
  } = useSpacedRepetition();

  const [activeTab, setActiveTab] = React.useState<RevisionTab>("overview");
  const [workspaceQueue, setWorkspaceQueue] = React.useState<RevisionItem[] | null>(null);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading Spaced Repetition engine & memory curves...
        </p>
      </div>
    );
  }

  const pendingItems = [...data.overdueItems, ...data.dueTodayItems];

  const handleStartFullWorkspace = () => {
    if (pendingItems.length > 0) {
      setWorkspaceQueue(pendingItems);
    } else {
      setWorkspaceQueue(data.allItems.slice(0, 5));
    }
  };

  const handleStartSingleItem = (item: RevisionItem) => {
    setWorkspaceQueue([item]);
  };

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Spaced Repetition & Revision
            </h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase tracking-wider">
              SM-2 Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base max-w-3xl leading-relaxed">
            Automated active recall revision system scheduling practice based on memory decay curves, problem difficulty, and AI review performance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              refresh();
              showToast("Spaced Repetition engine refreshed.");
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer shadow-xs"
            title="Refresh SRS Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleStartFullWorkspace}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Start Revision Session
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-10">
          <RevisionDashboardHeader
            metrics={data.dashboard}
            onStartWorkspace={handleStartFullWorkspace}
          />
          <div className="border-t border-slate-100 pt-8">
            <DueRevisionList
              dueItems={data.dueTodayItems}
              overdueItems={data.overdueItems}
              upcomingItems={data.upcomingItems}
              onStartWorkspaceItem={handleStartSingleItem}
              onMarkRemembered={(id) => {
                markRemembered(id);
                showToast("Marked as remembered! Interval extended.");
              }}
              onMarkForgotten={(id) => {
                markForgotten(id);
                showToast("Marked as forgotten. Resetting interval.");
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <RevisionCalendar
          calendarDays={data.calendarDays}
          onSelectItem={handleStartSingleItem}
        />
      )}

      {activeTab === "topics" && (
        <TopicRetentionPanel metrics={data.topicMetrics} />
      )}

      {activeTab === "coach" && (
        <AiRevisionCoachPanel
          report={data.coachReport}
          onStartItem={handleStartSingleItem}
        />
      )}

      {activeTab === "notifications" && (
        <RevisionNotificationPanel
          notifications={data.notifications}
          onDismiss={dismissNotification}
        />
      )}

      {/* Interactive Revision Workspace Modal */}
      {workspaceQueue && (
        <RevisionWorkspaceModal
          queue={workspaceQueue}
          onClose={() => setWorkspaceQueue(null)}
          onRemembered={(id) => {
            markRemembered(id);
            showToast("Progress saved (+Interval)");
          }}
          onForgotten={(id) => {
            markForgotten(id);
            showToast("Item scheduled for tomorrow");
          }}
        />
      )}
    </div>
  );
}
