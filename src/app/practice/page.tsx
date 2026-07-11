import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Filter } from "lucide-react";

export default function Practice() {
  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Today&apos;s Practice
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Challenge yourself with handpicked algorithms and coding problems tailored to your skill level.
        </p>
      </div>

      {/* Filter and Search Bar Placeholder */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
            disabled
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-not-allowed" disabled>
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="primary" size="sm" className="w-full sm:w-auto cursor-not-allowed" disabled>
            Quick Start
          </Button>
        </div>
      </div>

      {/* Grid of Recommended Problems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge variant="primary">Graphs</Badge>
                <h3 className="text-lg font-bold text-slate-800">Dijkstra&apos;s Shortest Path</h3>
              </div>
              <Badge variant="warning">Medium</Badge>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Implement Dijkstra&apos;s algorithm to find the shortest paths from a single source vertex to all other vertices.
            </p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">Estimated: 35 mins</span>
              <Button size="sm">Solve Challenge</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge variant="secondary">Arrays & Hashing</Badge>
                <h3 className="text-lg font-bold text-slate-800">Two Sum Optimization</h3>
              </div>
              <Badge variant="success">Easy</Badge>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find two numbers in an array that add up to a specific target sum. Optimize from O(N²) to O(N) complexity.
            </p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">Estimated: 15 mins</span>
              <Button size="sm">Solve Challenge</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
