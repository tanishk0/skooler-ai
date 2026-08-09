"use client";

import React from "react";
import ConceptContent from "../ConceptContent";

interface ReteachSectionProps {
  conceptName?: string;
  content: string;
}

export const ReteachSection: React.FC<ReteachSectionProps> = ({ conceptName, content }) => {
  return (
    <div className="w-full max-w-3xl rounded-md bg-amber-50/40 border border-amber-200/80 p-5 sm:p-6 shadow-2xs flex flex-col gap-3 font-sans my-4">
      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
        LET&apos;S LOOK AT IT DIFFERENTLY
      </span>
      <ConceptContent
        conceptTitle={conceptName || "Adapted Explanation"}
        content={content}
      />
    </div>
  );
};

export default ReteachSection;
