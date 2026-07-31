"use client";

import React, { useState, useRef, ChangeEvent } from "react";

export interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
}

export function FileUpload({ onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setStatusMsg(null);

    const fileArray = Array.from(newFiles);

    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...fileArray];
      onFilesChange?.(updatedFiles);
      return updatedFiles;
    });
  };

  const removeFile = (index: number) => {
    setStatusMsg(null);
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  const clearAll = () => {
    setStatusMsg(null);
    setFiles([]);
    if (onFilesChange) onFilesChange([]);
  };

  const handleUploadToPinecone = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setStatusMsg(null);

    let successCount = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to process ${file.name}`);
        }
        successCount++;
      } catch (err: any) {
        errors.push(err.message || `Error processing ${file.name}`);
      }
    }

    setIsUploading(false);

    if (errors.length === 0) {
      setStatusMsg({
        type: "success",
        text: `Successfully parsed, embedded, and stored ${successCount} file(s) in Pinecone!`,
      });
      setFiles([]);
      if (onFilesChange) onFilesChange([]);
    } else {
      setStatusMsg({
        type: "error",
        text: `Processed ${successCount}/${files.length} file(s). Errors: ${errors.join("; ")}`,
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Dropzone */}
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
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center space-y-4 ${
          isDragging
            ? "border-violet-500 bg-violet-100/60 scale-[1.01]"
            : "border-violet-200 hover:border-violet-400 bg-violet-50/40 hover:bg-violet-50/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />

        {/* Minimal Circle Icon */}
        <div className="w-14 h-14 rounded-full bg-violet-100/90 group-hover:bg-violet-200/80 text-violet-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {isDragging ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Supports PDF, DOCX, TXT, and Images
          </p>
        </div>

        {/* Pill Browse Button */}
        <span className="inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 group-hover:bg-violet-700 text-white text-xs font-semibold rounded-full shadow-md shadow-violet-500/20 transition-all">
          Browse Files
        </span>
      </div>

      {/* Status Message Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="ml-3 font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Selected Files List & Upload Button */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-slate-800">
              Active Files ({files.length})
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={isUploading}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {file.name}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => removeFile(idx)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Working Upload Button */}
          <button
            type="button"
            onClick={handleUploadToPinecone}
            disabled={isUploading}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing & Storing in Pinecone...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span>Upload to Pinecone</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
