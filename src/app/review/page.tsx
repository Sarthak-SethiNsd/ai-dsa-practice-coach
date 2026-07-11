import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";

export default function Review() {
  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          AI Review
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Deep-dive code evaluations and optimization recommendations generated for your submitted solutions.
        </p>
      </div>

      {/* Review Feedback Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Code Snippet Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Submitted Solution</CardTitle>
              <Badge variant="neutral">JavaScript / TypeScript</Badge>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-300 font-mono text-sm p-5 rounded-xl overflow-x-auto shadow-inner min-h-[250px]">
                <pre>{`// Find duplicate element in array
function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[0];
  
  // Floyd's Tortoise and Hare Cycle Detection
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  
  fast = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  
  return slow;
}`}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Comments/Insights */}
        <div className="space-y-6">
          <Card className="border-sky-100 bg-sky-50/25">
            <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Coach Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Complexity</span>
                <p className="text-sm font-semibold text-slate-800">Time Complexity: O(N)</p>
                <p className="text-sm font-semibold text-slate-800">Space Complexity: O(1)</p>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="space-y-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Key Takeaways</span>
                <div className="flex gap-2.5 items-start text-sm text-slate-600 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-2" />
                  <span>Excellent application of Floyd&apos;s Cycle Detection. Optimal O(1) auxiliary space achieved.</span>
                </div>
                <div className="flex gap-2.5 items-start text-sm text-slate-600 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-2" />
                  <span>Be mindful of edge cases where array sizes are smaller than required.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Need further assistance?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The Coach provides deep-dive refactoring steps and step-by-step memory trace diagrams when fully connected.
              </p>
              <Button size="sm" className="w-full" disabled>Ask Coach a Question</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
