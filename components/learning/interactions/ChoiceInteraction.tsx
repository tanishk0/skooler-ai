"use client";

import React from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { InteractionOption } from "@/lib/ai/types";

interface ChoiceInteractionProps {
  question: string;
  options?: InteractionOption[];
  onSubmitChoice: (choiceId: string, label: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

const DEFAULT_OPTIONS: InteractionOption[] = [
  { id: "yes", label: "Yes, I understand" },
  { id: "no", label: "Not really" },
];

export const ChoiceInteraction: React.FC<ChoiceInteractionProps> = ({
  question,
  options = DEFAULT_OPTIONS,
  onSubmitChoice,
  isSubmitting = false,
  isActive = true,
}) => {
  const displayOptions = options && options.length > 0 ? options : DEFAULT_OPTIONS;

  return (
    <div className={`w-full max-w-3xl rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 font-sans my-4 border transition-all min-w-0 ${
      isActive
        ? "bg-indigo-50/40 border-indigo-200/80 shadow-sm"
        : "bg-zinc-50/60 border-zinc-200/80 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className={`text-xs font-bold tracking-wider uppercase truncate ${isActive ? "text-indigo-600" : "text-zinc-500"}`}>
          FEYNMAN CHECK
        </span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-indigo-100/80 text-indigo-600" : "bg-zinc-200/60 text-zinc-500"}`}>
          {isActive ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed break-words min-w-0">
        {question || "Did that explanation make sense?"}
      </p>

      {/* Option Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 min-w-0">
        {displayOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={!isActive || isSubmitting}
            onClick={() => onSubmitChoice(opt.id, opt.label)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-sm max-w-full break-words ${
              isActive
                ? "bg-white border-zinc-200 text-zinc-800 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md cursor-pointer active:scale-[0.98]"
                : "bg-zinc-100 border-zinc-200/80 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceInteraction;
