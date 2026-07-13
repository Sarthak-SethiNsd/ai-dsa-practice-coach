"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { Search, Filter, BookOpen } from "lucide-react";

export default function Practice() {
  const router = useRouter();
  const { problems, selectedTopics, selectedLanguage, selectReviewProblem } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSolveClick = (problemId: number) => {
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
          Today&apos;s Practice
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Challenge yourself with handpicked algorithms and coding problems tailored to your skill level.
        </p>
      </div>

      {/* No topics empty state */}
      {selectedTopics.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-slate-800">No topics selected</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Set up your knowledge profile to generate personalised coding challenges.
              </p>
            </div>
            <Link href="/profile" passHref legacyBehavior>
              <Button variant="primary" size="sm" className="mt-2">
                Configure Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Language: {selectedLanguage}</span>
              </div>
              <Badge variant="neutral" className="px-3 py-1.5 text-xs">
                {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          {/* Problems Grid */}
          {filteredProblems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProblems.map((problem) => (
                <Card key={problem.id} className="flex flex-col justify-between">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap gap-1">
                          {problem.topics.slice(0, 2).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-[10px]">
                              {topic}
                            </Badge>
                          ))}
                          {problem.topics.length > 2 && (
                            <Badge variant="neutral" className="text-[10px]">
                              +{problem.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{problem.title}</h3>
                      </div>
                      <Badge variant={getDifficultyVariant(problem.difficulty)} className="shrink-0">
                        {problem.difficulty}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-slate-400 font-mono text-xs overflow-hidden">
                      <p className="truncate">
                        {`// ${selectedLanguage} - ${problem.title}`}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {`// Time: ${problem.complexity.time}  Space: ${problem.complexity.space}`}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-slate-400">Estimated: {problem.estimated}</span>
                      <Button
                        size="sm"
                        onClick={() => handleSolveClick(problem.id)}
                        className="cursor-pointer"
                      >
                        Solve Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-slate-500 font-medium">No problems match your search.</p>
                <p className="text-xs text-slate-400 mt-1">Try a different keyword.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
