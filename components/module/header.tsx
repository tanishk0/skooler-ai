"use client";

import React, { useState } from "react";
import { Search, BookOpen, Layers, X, Sparkles } from "lucide-react";
import { IStudyMaterial } from "@/lib/db/models";

interface ModuleHeaderProps {
  material: IStudyMaterial;
}

export function ModuleHeader({ material }: ModuleHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setAiAnswer(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), topK: 5, generateAnswer: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results || []);
        setAiAnswer(data.answer || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between text-zinc-100 font-sans">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                {material.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-indigo-400 border border-zinc-700 shrink-0">
                {material.subject}
              </span>
            </div>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {material.topics?.length || 0} Topics &bull; {material.chunksCount} Vector Chunks
            </p>
          </div>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search notes...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-zinc-950 text-[10px] text-zinc-500 border border-zinc-800">
            ⌘K
          </kbd>
        </button>
      </header>

      {/* Semantic Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Vector Semantic Search</span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-zinc-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask any question about this study material..."
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* AI Answer & Passage Results */}
            <div className="max-h-96 overflow-y-auto space-y-3 pt-2">
              {aiAnswer && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs text-zinc-200">
                  <div className="font-bold text-indigo-400">AI Answer</div>
                  <p className="leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                </div>
              )}

              {searchResults.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{r.fileName || "Document Passages"}</span>
                    <span className="text-indigo-400 font-semibold">{Math.round(r.score * 100)}% Match</span>
                  </div>
                  <p className="text-zinc-300 leading-normal">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
