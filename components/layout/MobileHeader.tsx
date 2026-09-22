"use client";

import React from "react";
import Image from "next/image";
import { Menu, LogOut } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  onMenuClick: () => void;
  rightAction?: React.ReactNode;
  onLogout?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  rightAction,
  onLogout,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full h-14 bg-[#FDF8F3]/95 backdrop-blur-md border-b border-[#4E342E]/10 px-4 flex items-center justify-between shrink-0 font-sans shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2 rounded-xl text-[#4E342E] hover:bg-[#4E342E]/5 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4E342E]/20"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/assets/logo.png"
            alt="Skooler"
            width={110}
            height={35}
            priority
            className="h-7 w-auto object-contain"
          />
        </div>
      </div>

      {title && (
        <div className="flex-1 mx-3 min-w-0 text-center">
          <h1 className="text-xs sm:text-sm font-semibold text-[#4E342E] truncate">
            {title}
          </h1>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {rightAction ? (
          rightAction
        ) : onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="p-2 rounded-xl text-[#8D6E63] hover:text-[#C62828] hover:bg-[#E57373]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default MobileHeader;
