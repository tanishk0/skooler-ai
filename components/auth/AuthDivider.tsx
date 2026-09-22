"use client";

import React from "react";

export interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  text = "Or continue with",
}) => {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#4E342E]/10"></div>
      </div>
      <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
        <span className="bg-white px-3 text-[#8D6E63] font-bold">
          {text}
        </span>
      </div>
    </div>
  );
};
