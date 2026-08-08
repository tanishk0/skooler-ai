"use client";

import React from "react";

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
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-500/10 dark:shadow-black/50 transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-500/25">
          S
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      <div>{children}</div>

      {(footerText || footerLinkText) && (
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {footerText}{" "}
          {footerLinkHref ? (
            <a
              href={footerLinkHref}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              {footerLinkText}
            </a>
          ) : onFooterLinkClick ? (
            <button
              type="button"
              onClick={onFooterLinkClick}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
            >
              {footerLinkText}
            </button>
          ) : (
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {footerLinkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
