"use client";

import React, { useState } from "react";
import { Send, Loader2, HelpCircle } from "lucide-react";

interface ShortAnswerInteractionProps {
  question: string;
  onSubmitAnswer: (answer: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

export const ShortAnswerInteraction: React.FC<ShortAnswerInteractionProps> = ({
  question,
  onSubmitAnswer,
  isSubmitting = false,
  isActive = true,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isSubmitting || !isActive) return;
    onSubmitAnswer(answer.trim());
  };

  return (
    <div className={`w-full max-w-3xl rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 font-sans my-4 border transition-all ${
      isActive
        ? "bg-indigo-50/40 border-indigo-200/80 shadow-sm"
        : "bg-zinc-50/60 border-zinc-200/80 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? "text-indigo-600" : "text-zinc-500"}`}>
          SHORT ANSWER
        </span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? "bg-indigo-100/80 text-indigo-600" : "bg-zinc-200/60 text-zinc-500"}`}>
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed">
        {question}
      </p>

      {/* Compact Input Box */}
      {isActive ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type concise answer..."
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isSubmitting || !answer.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Submit</span>
                <Send className="w-3.5 h-3.5 fill-white/20" />
              </>
            )}
          </button>
        </form>
      ) : (
        <span className="text-xs text-zinc-400 font-medium pt-1">
          Question answered (Read-only)
        </span>
      )}
    </div>
  );
};

export default ShortAnswerInteraction;
