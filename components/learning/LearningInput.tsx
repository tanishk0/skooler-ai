"use client";

import React, { useState, useRef } from "react";
import {
  Paperclip,
  Plus,
  FileText,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

export interface LearningInputProps {
  onStartLearning?: (data: { text: string; files: File[] }) => void;
  isLoading?: boolean;
}

export const LearningInput: React.FC<LearningInputProps> = ({
  onStartLearning,
  isLoading = false,
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAllowedFile = (file: File) => {
    const name = file.name.toLowerCase();
    return (
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      name.endsWith(".pdf") ||
      name.endsWith(".docx") ||
      name.endsWith(".doc")
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(isAllowedFile);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(isAllowedFile);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    if (onStartLearning) {
      onStartLearning({ text: text.trim(), files });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const SUGGESTION = "Explain quantum entanglement like I'm 15";

  return (
    <div className="w-full flex flex-col gap-3 font-sans">
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full bg-white rounded-md border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] shadow-xs ${
          isDragging
            ? "border-2 border-dashed border-indigo-400 bg-indigo-50/20"
            : "border-slate-200/80 focus-within:border-indigo-300 focus-within:shadow-md"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, paste notes, or drop a file..."
          rows={3}
          className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
        />

        {/* Attached Files List */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2 border-t border-slate-100 my-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="max-w-[180px] truncate">{file.name}</span>
                <span className="text-slate-400 text-[10px]">
                  ({formatFileSize(file.size)})
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach PDF or DOCX file"
              className="w-9 h-9 rounded-md bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add file or notes"
              className="w-9 h-9 rounded-md bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!text.trim() && files.length === 0)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <span>Start learning</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chip */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-indigo-600 font-bold">
          <span>Try:</span>
        </div>
        <button
          type="button"
          onClick={() => setText(`"${SUGGESTION}"`)}
          className="bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 font-medium text-xs px-3.5 py-1.5 rounded-md cursor-pointer transition-colors"
        >
          &ldquo;{SUGGESTION}&rdquo;
        </button>
      </div>
    </div>
  );
};

export default LearningInput;
