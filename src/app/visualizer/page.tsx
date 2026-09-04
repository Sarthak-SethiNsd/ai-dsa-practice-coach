import * as React from "react";
import type { Metadata } from "next";
import { VisualizerHub } from "@/components/visualizer/VisualizerHub";

export const metadata: Metadata = {
  title: "Interactive Algorithm Visualizer · DSA AI Coach",
  description: "Step-by-step state simulation, pointer mechanics, and synchronized pseudocode execution for core DSA patterns.",
};

export default function VisualizerPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-semibold">
            Loading algorithm visualizer...
          </div>
        }
      >
        <VisualizerHub />
      </React.Suspense>
    </main>
  );
}
