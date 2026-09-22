"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  X,
  Loader2,
} from "lucide-react";

export interface ModuleBuildingProgressProps {
  isOpen: boolean;
  topic?: string;
  mode?: "modal" | "inline";
  type?: "new_module" | "session_step";
  isCompleted?: boolean;
  error?: string | null;
  onClose?: () => void;
  className?: string;
}

const NEW_MODULE_STEPS = [
  "Analyzing topic scope and learning goals...",
  "Architecting modular curriculum & chapter roadmap...",
  "Structuring concepts with progressive difficulty...",
  "Synthesizing deep explanations, analogies & intuitive models...",
  "Formulating interactive Feynman checkpoints & quizzes...",
  "Calibrating dynamic assessment rubrics...",
  "Polishing lesson notes & preparing your workspace...",
  "Finalizing module setup... Getting everything ready for you!",
];

const SESSION_STEP_MESSAGES = [
  "Evaluating your explanation & conceptual reasoning...",
  "Calibrating mastery metrics and knowledge retention...",
  "Synthesizing adaptive feedback and tailored insights...",
  "Architecting the next interactive module checkpoint...",
  "Updating syllabus roadmap & preparing next challenge...",
];

const MILESTONES = [
  { id: 1, label: "Scope & Research", minProgress: 20 },
  { id: 2, label: "Curriculum Architecture", minProgress: 50 },
  { id: 3, label: "Lesson & Quiz Synthesis", minProgress: 80 },
  { id: 4, label: "Workspace Ready", minProgress: 100 },
];

export const ModuleBuildingProgress: React.FC<ModuleBuildingProgressProps> = ({
  isOpen,
  topic = "New Module",
  mode = "modal",
  type = "new_module",
  isCompleted = false,
  error = null,
  onClose,
  className = "",
}) => {
  const [progress, setProgress] = useState(10);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const statusMessages = useMemo(
    () => (type === "new_module" ? NEW_MODULE_STEPS : SESSION_STEP_MESSAGES),
    [type]
  );

  // Reset or run progress timer when active
  useEffect(() => {
    if (!isOpen) {
      setProgress(10);
      setElapsedSeconds(0);
      return;
    }

    if (error) return;

    if (isCompleted) {
      setProgress(100);
      return;
    }

    // Timer for elapsed seconds
    const secondInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Smooth asymptotic progress ticker
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98; // Hold at 98% until completion
        if (prev < 30) return prev + 1.2;
        if (prev < 60) return prev + 0.7;
        if (prev < 85) return prev + 0.4;
        if (prev < 95) return prev + 0.18;
        return prev + 0.06;
      });
    }, 150);

    return () => {
      clearInterval(secondInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, isCompleted, error]);

  if (!isOpen) return null;

  // Calculate current active status message based on elapsed time
  const currentMsgIndex = isCompleted
    ? statusMessages.length - 1
    : Math.floor(elapsedSeconds / 2.8) % (statusMessages.length - 1);
  const currentMessage = isCompleted
    ? "Module created successfully! Launching workspace..."
    : statusMessages[currentMsgIndex];

  const formattedTime = `${Math.floor(elapsedSeconds / 60)}:${(
    elapsedSeconds % 60
  )
    .toString()
    .padStart(2, "0")}`;

  const displayedProgress = Math.min(100, Math.round(progress));

  // Render Inline Mode
  if (mode === "inline") {
    return (
      <div
        className={`w-full max-w-3xl rounded-2xl bg-white border border-[#4E342E]/10 p-4 sm:p-5 shadow-xs flex flex-col gap-3 font-sans transition-all duration-300 ${className}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#4E342E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Cpu className="w-4 h-4 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#4E342E] tracking-tight block truncate">
                {isCompleted ? "Step Complete" : "Preparing Next Step"}
              </span>
              <span className="text-[11px] text-[#8D6E63] truncate block">
                {topic ? `Topic: ${topic}` : "Processing next lesson step"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-[#4E342E]">
              {displayedProgress}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-2.5 bg-[#4E342E]/10 rounded-full overflow-hidden border border-[#4E342E]/10 p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4E342E] via-[#6D4C41] to-[#8D6E63] transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${displayedProgress}%` }}
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer w-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Status Text & Timer */}
        <div className="flex items-center justify-between text-xs text-[#8D6E63] pt-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <Loader2 className="w-3.5 h-3.5 text-[#4E342E] animate-spin shrink-0" />
            <span className="truncate font-medium text-[#4E342E] text-xs transition-opacity duration-300">
              {currentMessage}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8D6E63] font-mono shrink-0">
            <Clock className="w-3 h-3 text-[#8D6E63]" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] text-xs flex items-center justify-between gap-2 mt-1 font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E57373]" />
              <span className="truncate">{error}</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#E57373] hover:underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render Modal Overlay Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg bg-[#FDF8F3] rounded-3xl border border-[#4E342E]/15 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden font-sans"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#4E342E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#F4A261]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#4E342E] text-white flex items-center justify-center shrink-0 shadow-md">
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />
              ) : (
                <Sparkles className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="modal-title"
                  className="font-bold text-[#4E342E] text-base sm:text-lg tracking-tight truncate"
                >
                  {isCompleted ? "Module Ready!" : "Building Your Module"}
                </h3>
              </div>
              <p className="text-xs text-[#8D6E63] truncate mt-0.5">
                Topic: <span className="font-semibold text-[#4E342E]">&ldquo;{topic}&rdquo;</span>
              </p>
            </div>
          </div>

          {/* Header Action */}
          <div className="shrink-0 flex items-center gap-2">
            {error && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error ? (
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#E57373] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed font-medium">
                <p className="font-semibold text-sm text-[#E57373] mb-1">Synthesis Failed</p>
                <p>{error}</p>
              </div>
            </div>
            {onClose && (
              <div className="flex justify-end pt-2 border-t border-[#E57373]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#E57373] hover:bg-[#E57373]/90 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Dismiss & Edit Topic
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Main Progress Bar Area */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs min-w-0">
                <span className="font-semibold text-[#4E342E] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4E342E]" />
                  <span>Module Generation Progress</span>
                </span>
                <span className="font-mono font-bold text-sm text-[#4E342E]">
                  {displayedProgress}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-3.5 bg-[#4E342E]/10 rounded-full overflow-hidden border border-[#4E342E]/10 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4E342E] via-[#6D4C41] to-[#8D6E63] transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${displayedProgress}%` }}
                >
                  {/* Fluid Shimmer Wave */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer w-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Rotating Status Phrase & Clock */}
              <div className="flex items-center justify-between text-xs text-[#8D6E63] pt-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Loader2 className="w-4 h-4 text-[#4E342E] animate-spin shrink-0" />
                  <span className="font-medium text-[#4E342E] text-xs truncate transition-all duration-300">
                    {currentMessage}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-[#8D6E63] shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Milestones Step Checklist */}
            <div className="bg-white rounded-2xl border border-[#4E342E]/10 p-3.5 sm:p-4 flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8D6E63] block mb-0.5">
                Curriculum Milestones
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {MILESTONES.map((m) => {
                  const isDone = displayedProgress >= m.minProgress;
                  const isActive =
                    !isDone &&
                    (m.id === 1 || displayedProgress >= MILESTONES[m.id - 2]?.minProgress);

                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        isDone
                          ? "bg-[#6B8F71]/10 border-[#6B8F71]/30 text-[#6B8F71] font-medium"
                          : isActive
                          ? "bg-[#4E342E]/5 border-[#4E342E]/20 text-[#4E342E] shadow-2xs font-semibold"
                          : "bg-transparent border-transparent text-[#8D6E63]/50"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#6B8F71] shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-[#4E342E] animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#4E342E]/20 shrink-0" />
                      )}
                      <span className="truncate">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Micro-Copy */}
            <p className="text-[11px] text-[#8D6E63] leading-relaxed text-center px-2">
              Our system creates customized, high-retention curricula from scratch.
              Nothing is frozen—deep synthesis takes around 15–30 seconds. Please keep this tab open.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleBuildingProgress;
