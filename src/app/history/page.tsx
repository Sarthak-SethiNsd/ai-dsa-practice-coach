import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Search } from "lucide-react";

export default function History() {
  const historyItems = [
    {
      id: 1,
      title: "Binary Tree Maximum Path Sum",
      date: "Jul 11, 2026",
      difficulty: "Hard",
      diffVariant: "warning" as const,
      status: "Solved",
      statusVariant: "success" as const,
    },
    {
      id: 2,
      title: "LRU Cache Design",
      date: "Jul 10, 2026",
      difficulty: "Medium",
      diffVariant: "primary" as const,
      status: "Incomplete",
      statusVariant: "neutral" as const,
    },
    {
      id: 3,
      title: "Merge K Sorted Lists",
      date: "Jul 08, 2026",
      difficulty: "Hard",
      diffVariant: "warning" as const,
      status: "Solved",
      statusVariant: "success" as const,
    },
    {
      id: 4,
      title: "Two Sum",
      date: "Jul 05, 2026",
      difficulty: "Easy",
      diffVariant: "success" as const,
      status: "Solved",
      statusVariant: "success" as const,
    },
  ];

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

      {/* History Table Container */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <CardTitle>Attempted Problems</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              disabled
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.title}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.diffVariant}>{item.difficulty}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.statusVariant}>{item.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
