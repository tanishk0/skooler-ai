"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { UploadModal } from "@/components/upload-modal";
import { IStudyMaterial } from "@/lib/db/models";
import {
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Brain,
  LineChart,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function Home() {
  const [materials, setMaterials] = useState<IStudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDeleteMaterial = async (id: string) => {
    try {
      await fetch(`/api/materials/${id}`, { method: "DELETE" });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        materials={materials}
        onOpenUpload={() => setIsUploadOpen(true)}
        onDeleteMaterial={handleDeleteMaterial}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Study Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Evidence-Based AI
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Upload your notes to unlock Short Notes, Active Recall Quizzes, and Feynman Learning.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>

        {/* Empty State: Centered Large Upload Card */}
        {materials.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-xl bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
              {/* Glow backdrop */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Study smarter with your own notes.
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Upload PDFs, DOCX, Images or Text to turn raw notes into active recall flashcards, Feynman challenges, and structured notes.
                </p>
              </div>

              {/* Drag & Drop Trigger Area */}
              <div
                onClick={() => setIsUploadOpen(true)}
                className="p-8 border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 bg-zinc-950/60 hover:bg-zinc-950 rounded-2xl cursor-pointer transition-all space-y-3 group"
              >
                <UploadCloud className="w-8 h-8 mx-auto text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <p className="text-xs font-bold text-zinc-300">
                  Click or drag files here to start learning
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {["PDF", "DOCX", "TXT", "PNG", "JPEG"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Materials Grid */}
        {materials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Recent Study Materials</span>
              </h2>
              <span className="text-xs text-zinc-500">{materials.length} Materials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((mat) => {
                const formattedDate = new Date(mat.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Link
                    key={mat.id}
                    href={`/module/${mat.id}`}
                    className="group relative p-5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 transition-all shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {mat.subject}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                      </div>

                      <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {mat.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {mat.summary || "Study material module ready for active learning."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{mat.topics?.length || 0} Topics</span>
                      <span>Uploaded {formattedDate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Features Grid */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Platform Capabilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-xs text-white">Short Notes</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Synthesizes bullet points, definitions, formulas, and real-world examples.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-xs text-white">Quiz Me</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Active recall flashcard quizzes with instant feedback and score reports.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-xs text-white">Feynman Learning</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Teach the AI in simple language; receive feedback on clarity and missing concepts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-xs text-white">Study Insights</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Tracks mastery score, strong topics, weak areas, and recommended focus paths.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(matId) => {
          fetchMaterials();
          window.location.href = `/module/${matId}`;
        }}
      />
    </div>
  );
}
