"use client";

import React from "react";
import { Bot } from "lucide-react";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  onFooterLinkClick?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  onFooterLinkClick,
}) => {
  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">
            Skooler <span className="text-indigo-600">AI</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            {subtitle}
          </p>
        )}
      </div>

      <div>{children}</div>

      {(footerText || footerLinkText) && (
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-500">
          {footerText}{" "}
          {footerLinkHref ? (
            <a
              href={footerLinkHref}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              {footerLinkText}
            </a>
          ) : onFooterLinkClick ? (
            <button
              type="button"
              onClick={onFooterLinkClick}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors cursor-pointer"
            >
              {footerLinkText}
            </button>
          ) : (
            <span className="font-semibold text-indigo-600">
              {footerLinkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
