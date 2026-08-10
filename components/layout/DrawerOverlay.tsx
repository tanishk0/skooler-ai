"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right";
  title?: string;
}

export const DrawerOverlay: React.FC<DrawerOverlayProps> = ({
  isOpen,
  onClose,
  children,
  position = "left",
  title,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`relative z-10 flex flex-col w-72 sm:w-80 max-w-[85vw] h-full bg-white shadow-2xl transition-transform duration-300 ease-out animate-in ${
          position === "left"
            ? "slide-in-from-left justify-start border-r border-slate-200"
            : "ml-auto slide-in-from-right justify-end border-l border-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <h3 className="font-semibold text-slate-800 text-sm truncate min-w-0 pr-2">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-w-0">{children}</div>
      </div>
    </div>
  );
};

export default DrawerOverlay;
