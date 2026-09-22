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
  "Finalizing module setup... Engine working to bring you in!",
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
        className={`w-full max-w-3xl rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100 p-4 sm:p-5 shadow-xs flex flex-col gap-3 font-sans transition-all duration-300 ${className}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Cpu className="w-4 h-4 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 tracking-tight block truncate">
                {isCompleted ? "Step Complete" : "Skooler AI Engine Active"}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {topic ? `Topic: ${topic}` : "Processing next lesson step"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted && !error && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>Engine Working</span>
              </span>
            )}
            <span className="text-xs font-mono font-bold text-indigo-700">
              {displayedProgress}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${displayedProgress}%` }}
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer w-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Status Text & Timer */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
            <span className="truncate font-medium text-slate-700 text-xs transition-opacity duration-300">
              {currentMessage}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="truncate">{error}</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline shrink-0 cursor-pointer"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden font-sans"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
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
                  className="font-bold text-slate-900 text-base sm:text-lg tracking-tight truncate"
                >
                  {isCompleted ? "Module Ready!" : "Building Your Module"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Topic: <span className="font-semibold text-slate-700">&ldquo;{topic}&rdquo;</span>
              </p>
            </div>
          </div>

          {/* Engine Status Live Badge */}
          <div className="shrink-0 flex items-center gap-2">
            {!error && !isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Engine Active</span>
              </span>
            )}
            {error && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error ? (
          <div className="flex flex-col gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed font-medium">
                <p className="font-semibold text-sm text-red-900 mb-1">Synthesis Failed</p>
                <p>{error}</p>
              </div>
            </div>
            {onClose && (
              <div className="flex justify-end pt-2 border-t border-red-200/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
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
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Module Generation Progress</span>
                </span>
                <span className="font-mono font-bold text-sm text-indigo-600">
                  {displayedProgress}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${displayedProgress}%` }}
                >
                  {/* Fluid Shimmer Wave */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer w-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Rotating Status Phrase & Clock */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  <span className="font-medium text-slate-800 text-xs truncate transition-all duration-300">
                    {currentMessage}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Milestones Step Checklist */}
            <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-3.5 sm:p-4 flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Engine Pipeline Milestones
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
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        isDone
                          ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 font-medium"
                          : isActive
                          ? "bg-white border-indigo-200 text-indigo-900 shadow-2xs font-semibold"
                          : "bg-transparent border-transparent text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Micro-Copy */}
            <p className="text-[11px] text-slate-400 leading-relaxed text-center px-2">
              Our AI teaching engine creates customized, high-retention curricula from scratch.
              Nothing is frozen—deep synthesis takes around 15–30 seconds. Please keep this tab open.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleBuildingProgress;
