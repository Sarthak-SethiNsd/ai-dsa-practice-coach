"use client";

import * as React from "react";
import { PseudocodeLine } from "@/services/visualizer/visualizerTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Code2 } from "lucide-react";

interface CodeHighlighterPanelProps {
  pseudocode: readonly PseudocodeLine[];
  activeLineNumber: number;
}

export function CodeHighlighterPanel({
  pseudocode,
  activeLineNumber,
}: CodeHighlighterPanelProps) {
  return (
    <Card className="flex flex-col overflow-hidden bg-slate-950 border border-slate-800 shadow-sm text-slate-200">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/60">
        <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <Code2 className="w-3.5 h-3.5 text-sky-400" /> Algorithm Pseudocode Tracer
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 font-mono text-xs overflow-x-auto space-y-0.5">
        {pseudocode.map((line) => {
          const isActive = line.lineNumber === activeLineNumber;

          return (
            <div
              key={line.lineNumber}
              className={`flex items-center px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? "bg-sky-500/20 border-l-2 border-sky-400 text-sky-200 font-bold"
                  : "text-slate-400 hover:bg-slate-900/50"
              }`}
            >
              {/* Line Number */}
              <span className="w-6 text-[10px] text-slate-500 select-none shrink-0 font-mono">
                {line.lineNumber}
              </span>

              {/* Code with Indentation */}
              <span
                className="whitespace-pre"
                style={{ paddingLeft: `${line.indent * 14}px` }}
              >
                {line.code}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
