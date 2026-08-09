"use client";

import React from "react";
import { CheckCircle2, BookOpen, Award } from "lucide-react";

interface SessionCompleteSectionProps {
  topic: string;
  modulesCompleted?: number;
  totalModules?: number;
  conceptsMastered?: number;
  totalConcepts?: number;
  masteryPercentage?: number;
}

export const SessionCompleteSection: React.FC<SessionCompleteSectionProps> = ({
  topic,
  modulesCompleted,
  totalModules,
  conceptsMastered,
  totalConcepts,
  masteryPercentage = 100,
}) => {
  return (
    <div className="w-full max-w-3xl rounded-md bg-emerald-50/80 border border-emerald-200 p-6 sm:p-8 shadow-2xs flex flex-col gap-6 text-slate-900 font-sans my-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
              CURRICULUM COMPLETED
            </span>
            <h2 className="font-serif text-2xl font-bold text-slate-950">
              {topic}
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{Math.round(masteryPercentage)}% Mastery</span>
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed font-medium">
        Congratulations! You have completed the learning session and demonstrated mastery across the entire curriculum. You can review your interaction log and timeline anytime.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {modulesCompleted !== undefined && (
          <div className="p-3.5 rounded-md bg-white border border-emerald-200/80 flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Modules
            </span>
            <span className="text-base font-bold text-emerald-950">
              {modulesCompleted} {totalModules ? `/ ${totalModules}` : ""} Completed
            </span>
          </div>
        )}

        {conceptsMastered !== undefined && (
          <div className="p-3.5 rounded-md bg-white border border-emerald-200/80 flex flex-col gap-1 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Concepts
            </span>
            <span className="text-base font-bold text-emerald-950">
              {conceptsMastered} {totalConcepts ? `/ ${totalConcepts}` : ""} Mastered
            </span>
          </div>
        )}

        <div className="p-3.5 rounded-md bg-white border border-emerald-200/80 flex flex-col gap-1 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Status
          </span>
          <span className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionCompleteSection;
