"use client";

import React from "react";

interface UserAnswerSectionProps {
  content: string;
}

export const UserAnswerSection: React.FC<UserAnswerSectionProps> = ({ content }) => {
  return (
    <div className="w-full max-w-3xl rounded-md bg-slate-50 border border-slate-200/90 p-4 shadow-2xs flex flex-col gap-1.5 font-sans my-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        YOUR EXPLANATION
      </span>
      <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed italic">
        &ldquo;{content}&rdquo;
      </p>
    </div>
  );
};

export default UserAnswerSection;
