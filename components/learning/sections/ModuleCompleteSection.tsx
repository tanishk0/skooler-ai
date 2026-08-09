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
    <div className="w-full max-w-3xl rounded-md bg-indigo-50/70 border border-indigo-200/90 p-6 shadow-2xs flex flex-col gap-3 text-slate-900 font-sans my-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
            MODULE COMPLETE
          </span>
          <h3 className="font-serif text-xl font-bold text-slate-950">
            {moduleName}
          </h3>
        </div>
      </div>

      {description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {description}
        </p>
      )}

      {conceptsCompleted !== undefined && totalConcepts !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-indigo-100 text-xs font-semibold text-indigo-900">
          <span className="px-2.5 py-1 rounded-md bg-white border border-indigo-200/80 shadow-2xs">
            {conceptsCompleted} / {totalConcepts} concepts mastered
          </span>
        </div>
      )}
    </div>
  );
};

export default ModuleCompleteSection;
