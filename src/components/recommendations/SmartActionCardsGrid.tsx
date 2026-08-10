"use client";

import * as React from "react";
import { SmartActionCard, ActionPriority } from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Zap, CheckCircle2, ArrowRight, Filter, AlertCircle, Clock } from "lucide-react";

interface SmartActionCardsGridProps {
  actionCards: SmartActionCard[];
  onToggleCard: (id: string) => void;
}

export function SmartActionCardsGrid({
  actionCards,
  onToggleCard,
}: SmartActionCardsGridProps) {
  const [priorityFilter, setPriorityFilter] = React.useState<"All" | ActionPriority>("All");

  const filteredCards = React.useMemo(() => {
    if (priorityFilter === "All") return actionCards;
    return actionCards.filter((c) => c.priority === priorityFilter);
  }, [actionCards, priorityFilter]);

  const priorityBadgeVariant = (priority: ActionPriority) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/50";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50";
      case "Low":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/50";
    }
  };

  const priorityIcon = (priority: ActionPriority) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case "Medium":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "Low":
        return <Clock className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <CardTitle className="text-slate-900 dark:text-white">Smart Action Cards</CardTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritized recommendations mapped directly to your recent mistake trends
          </p>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(["All", "High", "Medium", "Low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                priorityFilter === p
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            No action cards found for priority filter &quot;{priorityFilter}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const isCompleted = card.completed;
              return (
                <div
                  key={card.id}
                  className={`group relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                    isCompleted
                      ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 opacity-60"
                      : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Priority & Category */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="neutral"
                          className={`text-[11px] font-bold border ${priorityBadgeVariant(
                            card.priority
                          )}`}
                        >
                          <span className="flex items-center gap-1">
                            {priorityIcon(card.priority)}
                            {card.priority} Priority
                          </span>
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">• {card.category}</span>
                      </div>

                      <button
                        onClick={() => onToggleCard(card.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isCompleted
                            ? "text-emerald-500 hover:text-emerald-600"
                            : "text-slate-300 hover:text-emerald-500 dark:text-slate-600"
                        }`}
                        title={isCompleted ? "Mark incomplete" : "Mark as completed"}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-base font-bold text-slate-900 dark:text-white ${
                        isCompleted ? "line-through text-slate-500 dark:text-slate-500" : ""
                      }`}
                    >
                      {card.title}
                    </h4>

                    {/* Reason */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Reason: </span>
                      <span className="text-slate-600 dark:text-slate-400">{card.reason}</span>
                    </div>

                    {/* Suggested Action */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Suggested Action:</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {card.suggestedAction}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Target: {card.targetTopic || "DSA Practice"}
                    </span>

                    <Button
                      href={card.actionUrl || "/practice"}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 cursor-pointer gap-1 p-1 h-auto"
                    >
                      <span>Practice Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
