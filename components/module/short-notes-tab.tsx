"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Check,
  Copy,
  Download,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Code,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { IStudyMaterial, ITopic, IShortNote } from "@/lib/db/models";

interface ShortNotesTabProps {
  material: IStudyMaterial;
}

export function ShortNotesTab({ material }: ShortNotesTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    material.topics?.[0]?.name || "Core Concepts"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [note, setNote] = useState<IShortNote | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateNotes = async (topicName?: string) => {
    const topic = topicName || selectedTopic;
    setIsGenerating(true);
    setNote(null);

    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id, topic }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate short notes");
      }

      setNote(data.note);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!note) return;
    const formattedText = `SHORT NOTES: ${note.topic}\n\nSUMMARY:\n${note.summary}\n\nKEY BULLET POINTS:\n${note.bulletPoints.map((b) => `• ${b}`).join("\n")}\n\nDEFINITIONS:\n${note.definitions.map((d) => `• ${d.term}: ${d.definition}`).join("\n")}\n\nKEY FORMULAS / LAWS:\n${note.keyFormulas.map((f) => `• ${f}`).join("\n")}\n\nEXAMPLES:\n${note.examples.map((e) => `• ${e}`).join("\n")}`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!note) return;
    const formattedText = `====================================\nSKOOLER AI - SHORT NOTES\nMaterial: ${material.title}\nTopic: ${note.topic}\nDate: ${new Date(note.createdAt).toLocaleDateString()}\n====================================\n\n1. EXECUTIVE SUMMARY\n${note.summary}\n\n2. KEY BULLET POINTS\n${note.bulletPoints.map((b) => `• ${b}`).join("\n")}\n\n3. ESSENTIAL DEFINITIONS\n${note.definitions.map((d) => `• ${d.term}: ${d.definition}`).join("\n")}\n\n4. CORE FORMULAS & LAWS\n${note.keyFormulas.map((f) => `• ${f}`).join("\n")}\n\n5. PRACTICAL EXAMPLES\n${note.examples.map((e) => `• ${e}`).join("\n")}\n`;

    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, "_")}_${note.topic.replace(/\s+/g, "_")}_Notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Topic Selection Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Select Topic for Short Notes</h2>
            <p className="text-xs text-zinc-400">Choose a topic extracted from your material to generate structured notes.</p>
          </div>
          <button
            onClick={() => handleGenerateNotes()}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Notes</span>
              </>
            )}
          </button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {material.topics?.map((topic) => {
            const isSelected = selectedTopic === topic.name;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.name);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-950/50 border-indigo-500/50 text-white shadow-md"
                    : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-zinc-200 truncate">{topic.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </div>
                <p className="text-[11px] text-zinc-500 line-clamp-1">{topic.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6 animate-pulse">
          <div className="h-5 bg-zinc-800 rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800/80 rounded w-full" />
            <div className="h-4 bg-zinc-800/80 rounded w-5/6" />
            <div className="h-4 bg-zinc-800/80 rounded w-4/6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-28 bg-zinc-800/50 rounded-2xl" />
            <div className="h-28 bg-zinc-800/50 rounded-2xl" />
          </div>
        </div>
      )}

      {/* Generated Short Notes View */}
      {!isGenerating && note && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Short Notes
              </span>
              <h3 className="text-xl font-extrabold text-white">{note.topic}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => handleGenerateNotes()}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Regenerate Notes"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Note Sections */}
          <div className="space-y-6">
            {/* Executive Summary */}
            {note.summary && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">Executive Overview:</span>
                {note.summary}
              </div>
            )}

            {/* Bullet Points */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Key Bullet Points</span>
              </h4>
              <div className="space-y-2">
                {note.bulletPoints.map((bullet, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Definitions Grid */}
            {note.definitions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  <span>Essential Definitions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {note.definitions.map((def, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                      <span className="font-bold text-xs text-violet-400">{def.term}</span>
                      <p className="text-xs text-zinc-400 leading-normal">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Formulas / Principles */}
            {note.keyFormulas.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Key Formulas & Laws</span>
                </h4>
                <div className="space-y-2">
                  {note.keyFormulas.map((formula, i) => (
                    <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs font-mono text-cyan-300">
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {note.examples.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Practical Examples</span>
                </h4>
                <div className="space-y-2">
                  {note.examples.map((example, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-zinc-300">
                      💡 {example}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && !note && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-zinc-600" />
          <h3 className="text-sm font-bold text-white">No Notes Generated Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Select a topic above and click &quot;Generate Notes&quot; to synthesize formatted bullet points, definitions, formulas, and examples.
          </p>
        </div>
      )}
    </div>
  );
}
