"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface MasteredSectionProps {
  conceptName: string;
}

export const MasteredSection: React.FC<MasteredSectionProps> = ({ conceptName }) => {
  return (
    <div className="w-full max-w-3xl rounded-2xl bg-white border border-[#6B8F71]/30 p-5 shadow-sm flex items-center gap-3.5 text-[#4E342E] font-sans my-4">
      <div className="w-10 h-10 rounded-xl bg-[#6B8F71] text-white flex items-center justify-center shrink-0 shadow-xs">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B8F71] block mb-0.5">
          CONCEPT MASTERED
        </span>
        <h3 className="font-serif text-lg font-bold text-[#4E342E]">
          {conceptName}
        </h3>
      </div>
    </div>
  );
};

export default MasteredSection;
