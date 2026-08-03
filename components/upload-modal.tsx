"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (materialId: string) => void;
}

type StepState = "idle" | "uploading" | "extracting" | "topics" | "embeddings" | "complete" | "error";

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<StepState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStep("uploading");
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate multi-stage progression visuals
      setTimeout(() => setStep("extracting"), 800);
      setTimeout(() => setStep("topics"), 2000);
      setTimeout(() => setStep("embeddings"), 3500);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process study material.");
      }

      setStep("complete");
      setTimeout(() => {
        setStep("idle");
        setFile(null);
        onClose();
        onSuccess(data.materialId);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStep("error");
      setErrorMsg(err.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={step !== "idle" && step !== "complete" && step !== "error"}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1 cursor-pointer disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2">
            <span>Upload Study Material</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-xs text-zinc-400">
            Skooler AI will parse text, build vector embeddings, and extract key topics.
          </p>
        </div>

        {/* State: Idle & Dropzone */}
        {step === "idle" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center space-y-3 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-950/30 scale-[1.01]"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {file ? file.name : "Drag & Drop or Click to Browse"}
                </p>
                <p className="text-xs text-zinc-500">
                  Supported formats: PDF, DOCX, TXT, PNG, JPEG
                </p>
              </div>
            </div>

            {/* Selected File Card */}
            {file && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate text-zinc-200 font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-zinc-500 hover:text-red-400 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Process Study Material</span>
            </button>
          </div>
        )}

        {/* State: Processing Steps */}
        {step !== "idle" && step !== "error" && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              {step === "complete" ? (
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white">
                  {step === "uploading" && "Uploading material..."}
                  {step === "extracting" && "Extracting text & OCR..."}
                  {step === "topics" && "Extracting key topics..."}
                  {step === "embeddings" && "Generating vector embeddings..."}
                  {step === "complete" && "Module Ready!"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Building your personal AI study workspace
                </p>
              </div>
            </div>

            {/* Stepper indicators */}
            <div className="space-y-2 text-xs">
              {[
                { key: "uploading", label: "Uploading file" },
                { key: "extracting", label: "Extracting Text" },
                { key: "topics", label: "Generating Topics" },
                { key: "embeddings", label: "Creating Vector Embeddings" },
              ].map((s, idx) => {
                const stepOrder = ["uploading", "extracting", "topics", "embeddings", "complete"];
                const currentIdx = stepOrder.indexOf(step);
                const itemIdx = stepOrder.indexOf(s.key);

                const isDone = currentIdx > itemIdx;
                const isCurrent = currentIdx === itemIdx;

                return (
                  <div
                    key={s.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isDone
                        ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                        : isCurrent
                        ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300 font-semibold"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-600"
                    }`}
                  >
                    <span>{idx + 1}. {s.label}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-800" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* State: Error */}
        {step === "error" && (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>

            <button
              onClick={() => setStep("idle")}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
