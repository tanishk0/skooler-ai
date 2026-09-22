"use client";

import React from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { InteractionOption } from "@/lib/ai/types";

interface UnderstandingCheckProps {
  question: string;
  options?: InteractionOption[];
  onSubmitChoice: (choiceId: string, label: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

const DEFAULT_OPTIONS: InteractionOption[] = [
  { id: "understood", label: "I understand" },
  { id: "not_understood", label: "I don't understand" },
];

export const UnderstandingCheck: React.FC<UnderstandingCheckProps> = ({
  question,
  options = DEFAULT_OPTIONS,
  onSubmitChoice,
  isSubmitting = false,
  isActive = true,
}) => {
  const displayOptions = options && options.length > 0 ? options : DEFAULT_OPTIONS;

  return (
    <div
      className={`w-full max-w-3xl rounded-2xl border p-6 flex flex-col gap-5 font-sans my-4 transition-all shadow-sm ${
        isActive
          ? "bg-white border-[#4E342E]/15"
          : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-80"
      }`}
    >
      {/* Header Badge Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#4E342E]">
            QUICK CHECK
          </span>
          <span className="text-xs text-[#8D6E63] font-medium">• Self-Assessment</span>
        </div>
        <div className="text-[#8D6E63]">
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Question / Self-assessment Prompt */}
      <h3 className="text-base sm:text-lg font-bold text-[#4E342E] leading-snug">
        {question || "Do you understand this concept?"}
      </h3>

      {/* Option Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {displayOptions.map((opt) => {
          const lower = opt.label.toLowerCase();
          const isUnderstood =
            opt.id === "understood" ||
            (lower.includes("understand") && !lower.includes("don't") && !lower.includes("not"));

          return (
            <button
              key={opt.id}
              type="button"
              disabled={!isActive || isSubmitting}
              onClick={() => onSubmitChoice(opt.id, opt.label)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer active:scale-[0.99] ${
                !isActive
                  ? "bg-[#4E342E]/5 border border-[#4E342E]/10 text-[#8D6E63] cursor-not-allowed"
                  : isUnderstood
                  ? "bg-[#4E342E] hover:bg-[#3D2924] text-white border border-[#4E342E]"
                  : "bg-[#FDF8F3] hover:bg-[#4E342E]/5 border border-[#4E342E]/15 text-[#4E342E]"
              }`}
            >
              {isUnderstood ? (
                <CheckCircle2 className="w-4 h-4 text-[#6B8F71]" />
              ) : (
                <HelpCircle className="w-4 h-4 text-[#8D6E63]" />
              )}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnderstandingCheck;
