"use client";

import React from "react";
import { Menu, Bot } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  onMenuClick: () => void;
  rightAction?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  rightAction,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 font-sans shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight hidden xs:inline sm:inline">
            Skooler <span className="text-indigo-600">AI</span>
          </span>
        </div>
      </div>

      {title && (
        <div className="flex-1 mx-3 min-w-0 text-center">
          <h1 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            {title}
          </h1>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {rightAction}
      </div>
    </header>
  );
};

export default MobileHeader;
