"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { Calendar, Search, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function History() {
  const router = useRouter();
  const { history, selectReviewProblem } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredHistory = history.filter((item) =>
    item.problemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReviewClick = (problemId: number) => {
    selectReviewProblem(problemId);
    router.push("/review");
  };

  const getDifficultyVariant = (difficulty: string) => {
    if (difficulty === "Easy") return "success" as const;
    if (difficulty === "Medium") return "primary" as const;
    return "warning" as const;
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Practice History
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Review your historically attempted coding problems, dates, and completeness levels.
        </p>
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-slate-800">No history yet</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Complete your first challenge to see your attempt log here.
              </p>
            </div>
            <Link href="/practice" passHref legacyBehavior>
              <Button variant="primary" size="sm" className="mt-2">
                Start Practicing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
            <CardTitle>Attempted Problems</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Problem</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{item.problemTitle}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" /> {item.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getDifficultyVariant(item.difficulty)}>{item.difficulty}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={item.status === "Solved" ? "success" : "neutral"}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sky-600 hover:text-sky-700 cursor-pointer"
                            onClick={() => handleReviewClick(item.problemId)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500 font-medium">No results match your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
