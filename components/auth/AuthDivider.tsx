"use client";

import React from "react";

export interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  text = "Or continue with",
}) => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 dark:text-zinc-500 font-medium">
          {text}
        </span>
      </div>
    </div>
  );
};
