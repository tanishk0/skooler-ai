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
      className={`w-full max-w-3xl rounded-md border p-6 flex flex-col gap-5 font-sans my-4 transition-all shadow-2xs ${
        isActive
          ? "bg-indigo-50/20 border-indigo-100"
          : "bg-slate-50/60 border-slate-200/80 opacity-80"
      }`}
    >
      {/* Header Badge Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600">
            QUICK CHECK
          </span>
          <span className="text-xs text-slate-400 font-medium">• Self-Assessment</span>
        </div>
        <div className="text-indigo-400">
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Question / Self-assessment Prompt */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.99] ${
                !isActive
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : isUnderstood
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800"
              }`}
            >
              {isUnderstood ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <HelpCircle className="w-4 h-4 text-slate-400" />
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
