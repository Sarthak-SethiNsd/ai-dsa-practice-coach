"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react";
import { InterviewChatMessage, InterviewPhase, INTERVIEW_PHASES } from "@/services/interview/interviewTypes";

interface InterviewChatProps {
  messages: InterviewChatMessage[];
  currentPhase: InterviewPhase;
  onSendMessage: (msg: string) => Promise<void>;
  isProcessing: boolean;
}

export function InterviewChat({
  messages,
  currentPhase,
  onSendMessage,
  isProcessing,
}: InterviewChatProps) {
  const [inputVal, setInputVal] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    const text = inputVal;
    setInputVal("");
    await onSendMessage(text);
  };

  const phaseInfo = INTERVIEW_PHASES.find((p) => p.id === currentPhase);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Technical Interviewer
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h3>
            <p className="text-[10px] text-slate-400">
              Phase {phaseInfo?.number}: {phaseInfo?.shortLabel}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          Interactive Dialogue
        </span>
      </div>

      {/* Messages Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30"
      >
        {messages.map((msg) => {
          const isInterviewer = msg.sender === "interviewer";
          const isSystem = msg.sender === "system";

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center my-2 text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-xl py-2 px-3 leading-relaxed whitespace-pre-line"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isInterviewer ? "items-start" : "items-start flex-row-reverse"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isInterviewer
                    ? "bg-sky-600 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {isInterviewer ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                  isInterviewer
                    ? msg.isHint
                      ? "bg-amber-50 border border-amber-200 text-amber-900"
                      : "bg-white border border-slate-200 text-slate-800"
                    : "bg-sky-600 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 italic">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>Interviewer is evaluating your response…</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-100 bg-white flex gap-2"
      >
        <input
          type="text"
          placeholder="Explain your approach, ask clarifying questions, or discuss trade-offs..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isProcessing}
          className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
}
