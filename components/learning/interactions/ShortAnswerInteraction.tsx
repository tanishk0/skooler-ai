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
        ? "bg-white border-[#4E342E]/15 shadow-sm"
        : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? "text-[#4E342E]" : "text-[#8D6E63]"}`}>
          SHORT ANSWER
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? "bg-[#4E342E]/10 text-[#4E342E]" : "bg-[#4E342E]/5 text-[#6B8F71]"}`}>
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-[#4E342E] leading-relaxed">
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
            className="flex-1 bg-[#FDF8F3]/50 border border-[#4E342E]/15 rounded-xl px-4 py-2.5 text-sm text-[#4E342E] placeholder-[#8D6E63]/60 focus:outline-none focus:bg-white focus:border-[#4E342E] focus:ring-2 focus:ring-[#4E342E]/15 disabled:opacity-50 transition-all"
          />

          <button
            type="submit"
            disabled={isSubmitting || !answer.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white font-medium text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
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
        <span className="text-xs text-[#8D6E63] font-medium pt-1">
          Question answered (Read-only)
        </span>
      )}
    </div>
  );
};

export default ShortAnswerInteraction;
