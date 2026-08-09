"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface MasteredSectionProps {
  conceptName: string;
}

export const MasteredSection: React.FC<MasteredSectionProps> = ({ conceptName }) => {
  return (
    <div className="w-full max-w-3xl rounded-md bg-emerald-50/60 border border-emerald-200 p-5 shadow-2xs flex items-center gap-3 text-emerald-900 font-sans my-4">
      <div className="w-9 h-9 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
          CONCEPT MASTERED
        </span>
        <h3 className="font-serif text-lg font-bold text-emerald-950">
          {conceptName}
        </h3>
      </div>
    </div>
  );
};

export default MasteredSection;
