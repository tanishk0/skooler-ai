"use client";

import React from "react";

interface ConceptTransitionSectionProps {
  nextConceptName?: string;
  content: string;
}

export const ConceptTransitionSection: React.FC<ConceptTransitionSectionProps> = ({ nextConceptName, content }) => {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-3 my-6 text-center">
      <div className="flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-zinc-200" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          NEXT CONCEPT: {nextConceptName || "Moving Forward"}
        </span>
        <div className="flex-1 h-[1px] bg-zinc-200" />
      </div>
      <p className="text-sm text-zinc-600">{content}</p>
    </div>
  );
};

export default ConceptTransitionSection;
