"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ModuleCompleteSectionProps {
  moduleName: string;
  conceptsCompleted?: number;
  totalConcepts?: number;
  description?: string;
}

export const ModuleCompleteSection: React.FC<ModuleCompleteSectionProps> = ({
  moduleName,
  conceptsCompleted,
  totalConcepts,
  description,
}) => {
  return (
    <div className="w-full max-w-3xl rounded-2xl bg-white border border-[#4E342E]/15 p-6 shadow-sm flex flex-col gap-3 text-[#4E342E] font-sans my-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#6B8F71] text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B8F71] block">
            MODULE COMPLETE
          </span>
          <h3 className="font-serif text-xl font-bold text-[#4E342E]">
            {moduleName}
          </h3>
        </div>
      </div>

      {description && (
        <p className="text-xs sm:text-sm text-[#8D6E63] leading-relaxed font-medium">
          {description}
        </p>
      )}

      {conceptsCompleted !== undefined && totalConcepts !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#4E342E]/10 text-xs font-semibold text-[#4E342E]">
          <span className="px-2.5 py-1 rounded-lg bg-[#FDF8F3] border border-[#4E342E]/15 shadow-2xs">
            {conceptsCompleted} / {totalConcepts} concepts mastered
          </span>
        </div>
      )}
    </div>
  );
};

export default ModuleCompleteSection;
