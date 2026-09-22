"use client";

import React, { useState } from "react";
import { CheckCircle2, HelpCircle, Send, Loader2 } from "lucide-react";
import { InteractionOption } from "@/lib/ai/types";

interface MultipleChoiceInteractionProps {
  question: string;
  options?: InteractionOption[];
  onSubmitAnswer: (selectedId: string, selectedLabel: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

export const MultipleChoiceInteraction: React.FC<MultipleChoiceInteractionProps> = ({
  question,
  options = [],
  onSubmitAnswer,
  isSubmitting = false,
  isActive = true,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (!isActive || isSubmitting) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId || !isActive || isSubmitting) return;
    const opt = options.find((o) => o.id === selectedId);
    onSubmitAnswer(selectedId, opt ? opt.label : selectedId);
  };

  return (
    <div className={`w-full max-w-3xl rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 font-sans my-4 border transition-all min-w-0 ${
      isActive
        ? "bg-white border-[#4E342E]/15 shadow-sm"
        : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className={`text-xs font-bold tracking-wider uppercase truncate ${isActive ? "text-[#4E342E]" : "text-[#8D6E63]"}`}>
          CONCEPT CHECK
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#4E342E]/10 text-[#4E342E]" : "bg-[#4E342E]/5 text-[#6B8F71]"}`}>
          {isActive ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[#6B8F71]" />}
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-[#4E342E] leading-relaxed break-words min-w-0">
        {question || "Which statement best applies to this concept?"}
      </p>

      {/* Options Stack */}
      <div className="flex flex-col gap-2.5 pt-1 min-w-0">
        {options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={opt.id || idx}
              type="button"
              disabled={!isActive || isSubmitting}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-3 sm:p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all min-w-0 ${
                isSelected
                  ? "bg-[#4E342E] border-[#4E342E] text-white shadow-sm"
                  : isActive
                  ? "bg-[#FDF8F3]/50 border-[#4E342E]/15 text-[#4E342E] hover:border-[#4E342E]/40 hover:bg-white hover:shadow-sm cursor-pointer"
                  : "bg-[#4E342E]/5 border-[#4E342E]/10 text-[#8D6E63] cursor-not-allowed"
              }`}
            >
              <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-[#4E342E]/5 text-[#4E342E] border border-[#4E342E]/15"
              }`}>
                {letter}
              </span>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium leading-relaxed break-words min-w-0">
                  {opt.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {isActive && (
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            disabled={!selectedId || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white font-medium text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Submit Selection</span>
                <Send className="w-3.5 h-3.5 fill-white/20" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceInteraction;
