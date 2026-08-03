"use client";

import React, { useState } from "react";

interface VectorResult {
  id: string;
  score: number;
  text: string;
  fileName: string;
  materialId: string;
  chunkIndex: number;
}

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [generateAnswer, setGenerateAnswer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [searchResponse, setSearchResponse] = useState<{
    query: string;
    results: VectorResult[];
    answer: string | null;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    "Summarize the main concepts in the document",
    "What are the key definitions and formulas?",
    "What are the major conclusions or findings?",
    "Find all references to deadlines or important dates",
  ];

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery ?? query;

    if (!searchQuery.trim()) return;

    if (customQuery) setQuery(customQuery);

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          topK,
          generateAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete search query");
      }

      setSearchResponse({
        query: data.query,
        results: data.results || [],
        answer: data.answer || null,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Search Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl shadow-slate-950/50">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pinecone Vector Search & Gemini RAG</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ask Anything About Your Documents
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Semantic AI search searches deep inside your uploaded notes, PDFs, slides, and scanned images.
            </p>
          </div>

          {/* Search Input Form */}
          <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search concepts, questions, or topics..."
                className="w-full pl-12 pr-32 py-4 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              <svg
                className="absolute left-4 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>

            {/* Options bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateAnswer}
                    onChange={(e) => setGenerateAnswer(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">
                    Generate AI Synthesis (RAG)
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Max Results:</span>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={3}>3 Passages</option>
                  <option value={5}>5 Passages</option>
                  <option value={8}>8 Passages</option>
                  <option value={12}>12 Passages</option>
                </select>
              </div>
            </div>
          </form>

          {/* Sample Query Suggestions */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(undefined, sample)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-full px-3 py-1.5 transition-all hover:border-slate-500 cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 animate-spin" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-5/6" />
              <div className="h-3 bg-slate-800 rounded w-4/6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 space-y-3"
              >
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/6" />
                </div>
                <div className="h-3 bg-slate-800/80 rounded w-full" />
                <div className="h-3 bg-slate-800/80 rounded w-4/5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {!isLoading && searchResponse && (
        <div className="space-y-8">
          {/* AI Response Card */}
          {searchResponse.answer && (
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-xl shadow-indigo-950/30">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      AI Synthesized Answer
                    </h3>
                    <p className="text-xs text-slate-400">
                      Generated from matching document passages
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(searchResponse.answer || "", "ai-answer")
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedId === "ai-answer" ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy Answer</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {searchResponse.answer}
              </div>
            </div>
          )}

          {/* Matched Passages List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Matched Passages</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  {searchResponse.results.length}
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                Sorted by vector similarity score
              </span>
            </div>

            {searchResponse.results.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">
                  No vector matches found for &quot;{searchResponse.query}&quot;. Try adjusting your keywords or upload relevant documents.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {searchResponse.results.map((result) => {
                  const matchPercentage = Math.round(result.score * 100);

                  return (
                    <div
                      key={result.id}
                      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all shadow-md"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/70">
                        <div className="flex items-center space-x-2.5">
                          {/* File Tag */}
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60">
                            <svg
                              className="w-3.5 h-3.5 text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="max-w-[200px] truncate">
                              {result.fileName}
                            </span>
                          </span>

                          <span className="text-xs text-slate-500">
                            Chunk #{result.chunkIndex + 1}
                          </span>
                        </div>

                        {/* Similarity Score Badge */}
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              matchPercentage >= 75
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : matchPercentage >= 50
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {matchPercentage}% Match
                          </span>

                          <button
                            onClick={() =>
                              copyToClipboard(result.text, result.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                            title="Copy snippet"
                          >
                            {copiedId === result.id ? (
                              <svg
                                className="w-4 h-4 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
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
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Text Snippet */}
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {result.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
