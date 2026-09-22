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
        ? "bg-white border-[#4E342E]/15 shadow-sm"
        : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className={`text-xs font-bold tracking-wider uppercase truncate ${isActive ? "text-[#4E342E]" : "text-[#8D6E63]"}`}>
          FEYNMAN CHECK
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#4E342E]/10 text-[#4E342E]" : "bg-[#4E342E]/5 text-[#6B8F71]"}`}>
          {isActive ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[#6B8F71]" />}
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-[#4E342E] leading-relaxed break-words min-w-0">
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
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-sm max-w-full break-words ${
              isActive
                ? "bg-[#FDF8F3]/50 border-[#4E342E]/15 text-[#4E342E] hover:border-[#4E342E] hover:bg-white hover:shadow-sm cursor-pointer active:scale-[0.98]"
                : "bg-[#4E342E]/5 border-[#4E342E]/10 text-[#8D6E63] cursor-not-allowed"
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
