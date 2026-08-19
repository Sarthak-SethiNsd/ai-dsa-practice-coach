"use client";

import * as React from "react";
import { AIProgressNarrative } from "@/services/progress/progressTypes";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Compass,
  HeartHandshake,
} from "lucide-react";

interface AIProgressSummaryProps {
  narrative: AIProgressNarrative;
}

export function AIProgressSummary({ narrative }: AIProgressSummaryProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 border border-indigo-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">AI Progress Assessment</h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Verified Metrics Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500">Synthesized from problem notes, reviews, contests, and SRS retention</p>
        </div>
      </div>

      {/* Overall Assessment Banner */}
      <div className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-xs">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
          {narrative.overallAssessment}
        </p>
      </div>

      {/* 4 Diagnostic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. What Improved */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">What Improved</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
            {narrative.whatImproved.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. What Is Strong */}
        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
          <div className="flex items-center gap-2 text-sky-800">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Current Strengths</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-sky-950 font-medium">
            {narrative.whatIsStrong.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-sky-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. What Is Holding Back */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Growth Bottlenecks</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
            {narrative.whatIsHoldingBack.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Next Focus Areas */}
        <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-2">
          <div className="flex items-center gap-2 text-violet-800">
            <Compass className="w-4 h-4 text-violet-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Recommended Next Focus</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-violet-950 font-medium">
            {narrative.nextFocusAreas.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-violet-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Motivational Note */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2 border-t border-indigo-100/60">
        <HeartHandshake className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>{narrative.motivationalNote}</span>
      </div>
    </div>
  );
}
