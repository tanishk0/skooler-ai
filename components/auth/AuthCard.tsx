"use client";

import React from "react";
import Image from "next/image";

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
    <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-[#4E342E]/12 shadow-sm transition-all">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <Image
            src="/assets/logo.png"
            alt="Skooler"
            width={140}
            height={45}
            priority
            className="h-9 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-[#4E342E] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#8D6E63] mt-1.5">
            {subtitle}
          </p>
        )}
      </div>

      <div>{children}</div>

      {(footerText || footerLinkText) && (
        <div className="mt-8 pt-6 border-t border-[#4E342E]/10 text-center text-xs sm:text-sm text-[#8D6E63]">
          {footerText}{" "}
          {footerLinkHref ? (
            <a
              href={footerLinkHref}
              className="font-semibold text-[#4E342E] hover:text-[#2E1F1B] underline decoration-[#4E342E]/30 underline-offset-4 transition-colors"
            >
              {footerLinkText}
            </a>
          ) : onFooterLinkClick ? (
            <button
              type="button"
              onClick={onFooterLinkClick}
              className="font-semibold text-[#4E342E] hover:text-[#2E1F1B] underline decoration-[#4E342E]/30 underline-offset-4 transition-colors cursor-pointer"
            >
              {footerLinkText}
            </button>
          ) : (
            <span className="font-semibold text-[#4E342E]">
              {footerLinkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
