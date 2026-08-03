"use client";

import React, { useState, useRef, ChangeEvent } from "react";

export interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  onUploadSuccess?: () => void;
}

export function FileUpload({ onFilesChange, onUploadSuccess }: FileUploadProps) {
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
        text: `Successfully parsed, embedded, and indexed ${successCount} file(s) in Pinecone vector database!`,
      });
      setFiles([]);
      if (onFilesChange) onFilesChange([]);
      if (onUploadSuccess) onUploadSuccess();
    } else {
      setStatusMsg({
        type: "error",
        text: `Indexed ${successCount}/${files.length} file(s). Errors: ${errors.join("; ")}`,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Header Info */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Knowledge Base Ingestion
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Upload PDF textbooks, DOCX lecture notes, TXT documents, or OCR images to store vector embeddings for instant semantic search.
        </p>
      </div>

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
        className={`group relative flex flex-col items-center justify-center w-full p-8 sm:p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 text-center space-y-5 ${
          isDragging
            ? "border-indigo-500 bg-indigo-950/40 scale-[1.01]"
            : "border-slate-800 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900/90"
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

        {/* Glowing Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 text-indigo-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg shadow-indigo-500/10">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-bold text-white tracking-tight">
            {isDragging ? "Drop your files here" : "Drag and drop your study files"}
          </p>
          <p className="text-xs text-slate-400">
            Supports PDF (text & scanned OCR), DOCX, TXT, PNG, JPG, WEBP
          </p>
        </div>

        {/* Supported formats pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {["PDF", "DOCX", "TXT", "OCR Images"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/80"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Browse Button */}
        <span className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-indigo-600/30 transition-all">
          Browse Computer Files
        </span>
      </div>

      {/* Status Message Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="ml-3 font-bold hover:opacity-80 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Files List & Processing Action */}
      {files.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Selected Files</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {files.length}
              </span>
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={isUploading}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {files.map((file, idx) => {
              const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
              const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-indigo-400 border border-slate-700">
                      {extension}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{sizeMb} MB</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => removeFile(idx)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Upload & Vectorize Button */}
          <button
            type="button"
            onClick={handleUploadToPinecone}
            disabled={isUploading}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Parsing, Embedding & Ingesting to Pinecone...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
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
                <span>Ingest & Store in Pinecone</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
