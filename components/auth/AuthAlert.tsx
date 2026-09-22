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
      bg: "bg-[#E57373]/10 border-[#E57373]/30 text-[#C62828]",
      icon: <AlertCircle className="w-4 h-4 shrink-0 text-[#E57373]" />,
    },
    success: {
      bg: "bg-[#6B8F71]/10 border-[#6B8F71]/30 text-[#2E7D32]",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-[#6B8F71]" />,
    },
    info: {
      bg: "bg-[#4E342E]/5 border-[#4E342E]/15 text-[#4E342E]",
      icon: <Info className="w-4 h-4 shrink-0 text-[#4E342E]" />,
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
