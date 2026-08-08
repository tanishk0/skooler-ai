"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface AuthAlertProps {
  type?: "error" | "success" | "info";
  message: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({
  type = "error",
  message,
}) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
      icon: <AlertCircle className="w-4 h-4 shrink-0" />,
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    },
    info: {
      bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
      icon: <Info className="w-4 h-4 shrink-0" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium ${currentStyle.bg} animate-in fade-in slide-in-from-top-1 duration-200`}
    >
      {currentStyle.icon}
      <span>{message}</span>
    </div>
  );
};
