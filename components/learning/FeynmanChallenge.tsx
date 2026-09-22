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
      className={`w-full max-w-3xl rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 font-sans my-4 border transition-all min-w-0 ${
        isActive
          ? "bg-white border-[#4E342E]/15"
          : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-90"
      }`}
    >
      {/* Header Badge & Lightbulb Icon */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span
          className={`text-xs font-bold tracking-wider uppercase truncate ${
            isActive ? "text-[#4E342E]" : "text-[#8D6E63]"
          }`}
        >
          Feynman Challenge
        </span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isActive
              ? "bg-[#4E342E]/10 text-[#4E342E]"
              : "bg-[#4E342E]/5 text-[#6B8F71]"
          }`}
        >
          {isActive ? (
            <Lightbulb className="w-4 h-4 fill-[#4E342E]/20" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#6B8F71]" />
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <p className="font-sans text-sm sm:text-base font-medium text-[#4E342E] leading-relaxed break-words min-w-0">
        {question || "Explain this concept in your own words."}
      </p>

      {/* Textarea Input Box */}
      {isActive ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 min-w-0">
          <div className="w-full rounded-xl bg-[#FDF8F3]/50 border border-[#4E342E]/15 p-3 sm:p-4 shadow-2xs focus-within:bg-white focus-within:border-[#4E342E] focus-within:ring-2 focus-within:ring-[#4E342E]/15 transition-all min-w-0">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Type your explanation here..."
              rows={4}
              className="w-full bg-transparent text-[#4E342E] placeholder-[#8D6E63]/60 text-sm sm:text-base focus:outline-none resize-none leading-relaxed disabled:opacity-50 font-sans min-w-0"
            />

            {/* Footer Bar inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#4E342E]/10 mt-2 min-w-0">
              <span className="text-xs text-[#8D6E63] flex items-center gap-1 min-w-0">
                <span className="hidden xs:inline">Press </span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-[#4E342E]/5 border border-[#4E342E]/15 font-mono text-[10px] text-[#4E342E] font-medium shrink-0">
                  Enter
                </kbd>
                <span className="hidden xs:inline"> to submit</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white font-medium text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 ml-auto"
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
        <span className="text-xs text-[#8D6E63] font-medium pt-1 font-sans">
          Challenge completed (Read-only)
        </span>
      )}
    </div>
  );
};

export default FeynmanChallenge;
