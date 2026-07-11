import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, BookOpen, Activity, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 select-none">
      {/* Welcome / Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Welcome back, Explorer!
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Track your algorithmic progress, review code insights, and practice targeted DSA topics daily.
        </p>
      </div>

      {/* Grid Layout for Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Today's Progress */}
        <Card className="flex flex-col h-full justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics</span>
              <CardTitle>Today&apos;s Progress</CardTitle>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Trophy className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold text-slate-900">4 / 5</span>
                <span className="text-xs font-semibold text-slate-500">Problems Completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: "80%" }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="primary">Target met: 80%</Badge>
              <Badge variant="neutral">Streak: 12d</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full text-sky-600 hover:text-sky-700 font-semibold gap-1.5 cursor-pointer">
              View target details <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Today's Practice */}
        <Card className="flex flex-col h-full justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active task</span>
              <CardTitle>Today&apos;s Practice</CardTitle>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-800">Longest Common Subsequence</span>
                <Badge variant="warning">Hard</Badge>
              </div>
              <p className="text-xs text-slate-500">Dynamic Programming • 45m left</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="neutral">Topics: DP, String</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="sm" className="w-full font-semibold cursor-pointer">
              Start Practice
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3: Recent Activity */}
        <Card className="flex flex-col h-full justify-between md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">History log</span>
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-0.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-800">Binary Tree Maximum Path Sum</span>
                  <span className="text-[10px] text-slate-400">Completed • 2 hours ago</span>
                </div>
                <Badge variant="success">Solved</Badge>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between py-0.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-800">LRU Cache Design</span>
                  <span className="text-[10px] text-slate-400">Failed Test Cases • 5 hours ago</span>
                </div>
                <Badge variant="neutral">Incomplete</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm" className="w-full font-semibold cursor-pointer">
              View Full History
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
