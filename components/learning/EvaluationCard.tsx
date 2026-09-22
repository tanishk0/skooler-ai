"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Evaluation } from "@/lib/ai/types";

interface EvaluationCardProps {
  evaluation: Evaluation;
  onTryAgain?: () => void;
  onNextConcept?: () => void;
  onGetHint?: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  onTryAgain,
  onNextConcept,
  onGetHint,
}) => {
  const isMastered = Boolean(
    evaluation.masteryReached || evaluation.understanding === "mastered" || evaluation.understanding === "correct"
  );
  const isPartial = evaluation.understanding === "partial";

  const title = evaluation.understanding === "mastered"
    ? "Concept Mastered!"
    : evaluation.understanding === "correct"
    ? "Correct Explanation!"
    : isPartial
    ? "Partial Understanding"
    : "Review Recommended";

  const badgeBg = isMastered
    ? "bg-[#6B8F71]/15 text-[#6B8F71] border-[#6B8F71]/30"
    : isPartial
    ? "bg-[#F4A261]/15 text-[#B45309] border-[#F4A261]/30"
    : "bg-[#E57373]/15 text-[#C62828] border-[#E57373]/30";

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-white border border-[#4E342E]/12 p-5 sm:p-6 shadow-sm flex flex-col gap-4 font-sans my-4">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${badgeBg}`}>
          {isMastered ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {evaluation.nextAction && (
            <span className="text-[11px] font-semibold text-[#4E342E] bg-[#4E342E]/5 px-2.5 py-0.5 rounded-md border border-[#4E342E]/10 uppercase tracking-wider">
              {evaluation.nextAction.replace("_", " ")}
            </span>
          )}
          <span className="text-xs font-mono text-[#8D6E63]">
            Confidence: {Math.round((evaluation.confidence || 0.8) * 100)}%
          </span>
        </div>
      </div>

      {/* Main Feedback Text */}
      {evaluation.feedback && (
        <p className="text-sm sm:text-base text-[#4E342E] leading-relaxed font-medium">
          {evaluation.feedback}
        </p>
      )}

      {/* Misconceptions & Missing Concepts */}
      {((evaluation.misconceptions && evaluation.misconceptions.length > 0) ||
        (evaluation.missingConcepts && evaluation.missingConcepts.length > 0)) && (
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#F4A261]/10 border border-[#F4A261]/25 text-xs text-[#4E342E]">
          {evaluation.misconceptions && evaluation.misconceptions.length > 0 && (
            <div>
              <strong className="font-semibold block mb-1">Misconception Identified:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-[#8D6E63]">
                {evaluation.misconceptions.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
            <div className="mt-1">
              <strong className="font-semibold block mb-1">Missing Key Concept:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-[#8D6E63]">
                {evaluation.missingConcepts.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2.5 border-t border-[#4E342E]/10">
        {!isMastered && onGetHint && (
          <button
            type="button"
            onClick={onGetHint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#4E342E]/15 bg-[#FDF8F3] text-[#4E342E] hover:bg-[#4E342E]/5 text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#8D6E63]" />
            <span>Give Me a Hint</span>
          </button>
        )}

        {!isMastered && onTryAgain && (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#4E342E]/15 bg-[#FDF8F3] text-[#4E342E] hover:bg-[#4E342E]/5 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8D6E63]" />
            <span>Try Again</span>
          </button>
        )}

        {isMastered && onNextConcept && (
          <button
            type="button"
            onClick={onNextConcept}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <span>Continue to Next Concept</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluationCard;
