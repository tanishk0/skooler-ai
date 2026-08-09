"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface ContinueSectionProps {
  onContinue: () => void;
  isSubmitting?: boolean;
  label?: string;
}

export const ContinueSection: React.FC<ContinueSectionProps> = ({
  onContinue,
  isSubmitting = false,
  label = "Continue",
}) => {
  return (
    <div className="w-full max-w-3xl flex justify-end py-3 font-sans">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onContinue}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Loading next step...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default ContinueSection;
