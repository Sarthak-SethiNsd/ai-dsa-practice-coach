"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppContext } from "@/context/AppContext";
import { Trophy, BookOpen, Activity, ArrowUpRight } from "lucide-react";

const TOTAL_TOPICS_COUNT = 41;

export default function Home() {
  const router = useRouter();
  const { selectedLanguage, selectedTopics, problems, history, selectReviewProblem } = useAppContext();

  const completionPercentage = Math.round((selectedTopics.length / TOTAL_TOPICS_COUNT) * 100);
  const activeProblem = problems.length > 0 ? problems[0] : null;

  const handleReviewClick = (problemId: number) => {
    selectReviewProblem(problemId);
    router.push("/review");
  };

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
                <span className="text-3xl font-extrabold text-slate-900">
                  {selectedTopics.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  / {TOTAL_TOPICS_COUNT} Topics Known
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="primary">Language: {selectedLanguage}</Badge>
              <Badge variant="secondary">Mastery: {completionPercentage}%</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/profile" passHref legacyBehavior>
              <Button variant="ghost" size="sm" className="w-full text-sky-600 hover:text-sky-700 font-semibold gap-1.5 cursor-pointer">
                Configure Profile <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
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
            {activeProblem ? (
              <>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{activeProblem.title}</span>
                    <Badge variant={activeProblem.difficulty === "Easy" ? "success" : activeProblem.difficulty === "Medium" ? "primary" : "warning"}>
                      {activeProblem.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeProblem.topics.slice(0, 2).join(", ")} • {activeProblem.estimated} left
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="neutral">Targeting active topics</Badge>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-450 font-medium">No topics selected yet.</p>
                <p className="text-xs text-slate-400 mt-1">Configure profile to unlock challenges.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/practice" passHref legacyBehavior>
              <Button variant="primary" size="sm" className="w-full font-semibold cursor-pointer">
                Start Practice
              </Button>
            </Link>
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
            {history.length > 0 ? (
              <div className="space-y-3.5">
                {history.slice(0, 2).map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between py-0.5 gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-semibold text-slate-800 truncate">{item.problemTitle}</span>
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                      </div>
                      <button
                        onClick={() => handleReviewClick(item.problemId)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 shrink-0 hover:underline cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                    <div className="w-full h-px bg-slate-100 last:hidden" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-450 font-medium">No recent attempts.</p>
                <p className="text-xs text-slate-400 mt-1">Complete your first challenge to see history logs.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/history" passHref legacyBehavior>
              <Button variant="secondary" size="sm" className="w-full font-semibold cursor-pointer">
                View Full History
              </Button>
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
