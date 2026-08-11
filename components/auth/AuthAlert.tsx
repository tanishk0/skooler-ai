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
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />,
    },
    info: {
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
      icon: <Info className="w-4 h-4 shrink-0 text-indigo-500" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium ${currentStyle.bg} animate-in fade-in slide-in-from-top-1 duration-200`}
    >
      {currentStyle.icon}
      <span>{message}</span>
    </div>
  );
};
