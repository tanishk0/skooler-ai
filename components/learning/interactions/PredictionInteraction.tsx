"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface PredictionInteractionProps {
  question: string;
  onSubmitPrediction: (prediction: string) => void;
  isSubmitting?: boolean;
  isActive?: boolean;
}

export const PredictionInteraction: React.FC<PredictionInteractionProps> = ({
  question,
  onSubmitPrediction,
  isSubmitting = false,
  isActive = true,
}) => {
  const [prediction, setPrediction] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prediction.trim() || isSubmitting || !isActive) return;
    onSubmitPrediction(prediction.trim());
  };

  return (
    <div className={`w-full max-w-3xl rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 font-sans my-4 border transition-all ${
      isActive
        ? "bg-purple-50/40 border-purple-200/80 shadow-sm"
        : "bg-zinc-50/60 border-zinc-200/80 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? "text-purple-700" : "text-zinc-500"}`}>
          PREDICTION / HYPOTHESIS
        </span>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed">
        {question || "What do you think will happen when this runs?"}
      </p>

      {/* Input Box */}
      {isActive ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          <textarea
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your hypothesis..."
            rows={3}
            className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 resize-none"
          />

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !prediction.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs sm:text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Submit Prediction</span>
                  <Send className="w-3.5 h-3.5 fill-white/20" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <span className="text-xs text-zinc-400 font-medium pt-1">
          Prediction recorded (Read-only)
        </span>
      )}
    </div>
  );
};

export default PredictionInteraction;
