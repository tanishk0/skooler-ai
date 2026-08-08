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
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={`w-full ${
            icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-10" : "pr-3.5"} py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border ${
            error
              ? "border-red-500 dark:border-red-500 focus:ring-red-500/20"
              : "border-zinc-200 dark:border-zinc-700/70 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20"
          } rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm transition-all outline-none focus:ring-4 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
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
        <p className="text-xs text-red-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
};
