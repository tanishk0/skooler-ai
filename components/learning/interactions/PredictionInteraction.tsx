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
        ? "bg-white border-[#4E342E]/15 shadow-sm"
        : "bg-[#FDF8F3] border-[#4E342E]/10 opacity-90"
    }`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wider uppercase ${isActive ? "text-[#4E342E]" : "text-[#8D6E63]"}`}>
          PREDICTION / HYPOTHESIS
        </span>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-medium text-[#4E342E] leading-relaxed">
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
            className="w-full bg-[#FDF8F3]/50 border border-[#4E342E]/15 rounded-xl p-3 text-sm text-[#4E342E] placeholder-[#8D6E63]/60 focus:outline-none focus:bg-white focus:border-[#4E342E] focus:ring-2 focus:ring-[#4E342E]/15 disabled:opacity-50 resize-none transition-all"
          />

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !prediction.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white font-medium text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
        <span className="text-xs text-[#8D6E63] font-medium pt-1">
          Prediction recorded (Read-only)
        </span>
      )}
    </div>
  );
};

export default PredictionInteraction;
