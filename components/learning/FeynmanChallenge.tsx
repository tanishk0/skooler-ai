"use client";

import React, { useState } from "react";
import { Lightbulb, Send, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface FeynmanChallengeProps {
  question: string;
  onSubmitAnswer?: (answer: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

export const FeynmanChallenge: React.FC<FeynmanChallengeProps> = ({
  question,
  onSubmitAnswer,
  isSubmitting = false,
  isActive = true,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isSubmitting || !onSubmitAnswer || !isActive) return;
    onSubmitAnswer(answer.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`w-full max-w-3xl rounded-md p-5 sm:p-6 shadow-2xs flex flex-col gap-4 font-sans my-4 border transition-all ${
        isActive
          ? "bg-indigo-50/30 border-indigo-200/80"
          : "bg-slate-50/60 border-slate-200/80 opacity-90"
      }`}
    >
      {/* Header Badge & Lightbulb Icon */}
      <div className="flex items-center justify-between">
        {/* Playfair Display font applied specifically to "FEYNMAN CHALLENGE" text */}
        <span
          className={`text-xs font-bold tracking-wider uppercase ${
            isActive ? "text-indigo-600" : "text-slate-500"
          }`}
        >
          Feynman Challenge
        </span>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center ${
            isActive
              ? "bg-indigo-100/80 text-indigo-600"
              : "bg-slate-200/60 text-slate-500"
          }`}
        >
          {isActive ? (
            <Lightbulb className="w-4 h-4 fill-indigo-600/20" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Question Prompt in Inter (font-sans) */}
      <p className="font-sans text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
        {question || "Explain this concept in your own words."}
      </p>

      {/* Textarea Input Box */}
      {isActive ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="w-full rounded-md bg-white border border-slate-200/90 p-3 sm:p-4 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Type your explanation here..."
              rows={4}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none resize-none leading-relaxed disabled:opacity-50 font-sans"
            />

            {/* Footer Bar inside Card */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 font-medium">
                  Enter
                </kbd>{" "}
                to submit your answer
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <ArrowRight className="w-3.5 h-3.5 fill-white/20" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <span className="text-xs text-slate-400 font-medium pt-1 font-sans">
          Challenge completed (Read-only)
        </span>
      )}
    </div>
  );
};

export default FeynmanChallenge;
