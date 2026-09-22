"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  type = "text",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5 group">
      <label className="block text-[11px] font-bold text-[#4E342E] uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8D6E63] group-focus-within:text-[#4E342E] transition-colors">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={`w-full ${
            icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-10" : "pr-3.5"} py-2.5 bg-[#FDF8F3]/50 focus:bg-white border ${
            error
              ? "border-[#E57373] focus:border-[#E57373] focus:ring-[#E57373]/20"
              : "border-[#4E342E]/15 focus:border-[#4E342E] focus:ring-[#4E342E]/10"
          } rounded-xl text-[#4E342E] placeholder:text-[#8D6E63]/50 text-sm transition-all outline-none focus:ring-4 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8D6E63] hover:text-[#4E342E] transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#E57373] font-medium pl-0.5">{error}</p>
      )}
    </div>
  );
};
