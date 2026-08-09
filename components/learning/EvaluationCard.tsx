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
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isPartial
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-red-50 text-red-800 border-red-200";

  return (
    <div className="w-full max-w-3xl rounded-md bg-white border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col gap-4 font-sans my-4">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-semibold ${badgeBg}`}>
          {isMastered ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {evaluation.nextAction && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-wider">
              {evaluation.nextAction.replace("_", " ")}
            </span>
          )}
          <span className="text-xs font-mono text-slate-400">
            Confidence: {Math.round((evaluation.confidence || 0.8) * 100)}%
          </span>
        </div>
      </div>

      {/* Main Feedback Text */}
      {evaluation.feedback && (
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          {evaluation.feedback}
        </p>
      )}

      {/* Misconceptions & Missing Concepts */}
      {((evaluation.misconceptions && evaluation.misconceptions.length > 0) ||
        (evaluation.missingConcepts && evaluation.missingConcepts.length > 0)) && (
        <div className="flex flex-col gap-2 p-3.5 rounded-md bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900">
          {evaluation.misconceptions && evaluation.misconceptions.length > 0 && (
            <div>
              <strong className="font-semibold block mb-1">Misconception Identified:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {evaluation.misconceptions.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
            <div className="mt-1">
              <strong className="font-semibold block mb-1">Missing Key Concept:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {evaluation.missingConcepts.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
        {!isMastered && onGetHint && (
          <button
            type="button"
            onClick={onGetHint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Give Me a Hint</span>
          </button>
        )}

        {!isMastered && onTryAgain && (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Try Again</span>
          </button>
        )}

        {isMastered && onNextConcept && (
          <button
            type="button"
            onClick={onNextConcept}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
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
