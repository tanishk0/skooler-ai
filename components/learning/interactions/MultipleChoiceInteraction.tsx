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
        ? "bg-indigo-50/40 border-indigo-200/80 shadow-sm"
        : "bg-zinc-50/60 border-zinc-200/80 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className={`text-xs font-bold tracking-wider uppercase truncate ${isActive ? "text-indigo-600" : "text-zinc-500"}`}>
          CONCEPT CHECK
        </span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-indigo-100/80 text-indigo-600" : "bg-zinc-200/60 text-zinc-500"}`}>
          {isActive ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </div>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed break-words min-w-0">
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
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                  : isActive
                  ? "bg-white border-zinc-200 text-zinc-800 hover:border-indigo-400 hover:shadow-sm cursor-pointer"
                  : "bg-zinc-100 border-zinc-200/80 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
