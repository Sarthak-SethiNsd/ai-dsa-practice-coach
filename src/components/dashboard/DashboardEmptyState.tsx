import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, Sparkles } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <Card className="w-full">
      <CardContent className="py-16 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 relative">
          <BookOpen className="w-8 h-8" />
          <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-extrabold text-slate-900">No Analytics Yet</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your personalized performance metrics, weekly consistency, and platform breakdowns will appear here after you practice questions.
          </p>
        </div>
        <Button href="/practice" variant="primary" size="md" className="mt-2 font-semibold">
          Start Today&apos;s Practice
        </Button>
      </CardContent>
    </Card>
  );
}
