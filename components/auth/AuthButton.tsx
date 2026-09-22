"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = "primary",
  isLoading = false,
  fullWidth = true,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold text-sm rounded-xl py-2.5 px-4 transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]";

  const variantStyles = {
    primary:
      "bg-[#4E342E] hover:bg-[#3D2924] active:bg-[#2E1F1B] text-white shadow-sm hover:shadow-md focus:ring-[#4E342E]/15",
    secondary:
      "bg-[#8D6E63] hover:bg-[#795548] text-white focus:ring-[#8D6E63]/15",
    outline:
      "bg-[#FDF8F3] border border-[#4E342E]/15 hover:bg-[#4E342E]/5 text-[#4E342E] focus:ring-[#4E342E]/10 shadow-2xs",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
