"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { UploadModal } from "@/components/upload-modal";
import { ModuleHeader } from "@/components/module/header";
import { ShortNotesTab } from "@/components/module/short-notes-tab";
import { QuizTab } from "@/components/module/quiz-tab";
import { FeynmanTab } from "@/components/module/feynman-tab";
import { StudyInsightsTab } from "@/components/module/insights-tab";
import { IStudyMaterial } from "@/lib/db/models";
import {
  FileText,
  HelpCircle,
  Brain,
  LineChart,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [materials, setMaterials] = useState<IStudyMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<IStudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<
    "notes" | "quiz" | "feynman" | "insights"
  >("notes");

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentMaterial = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/materials/${id}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentMaterial(data.material);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchCurrentMaterial();
  }, [id]);

  const handleDeleteMaterial = async (matId: string) => {
    try {
      await fetch(`/api/materials/${matId}`, { method: "DELETE" });
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
      if (matId === id) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="text-sm font-semibold">Loading Study Module...</span>
        </div>
      </div>
    );
  }

  if (!currentMaterial) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-bold">Study Material Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          The requested study material may have been deleted or does not exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        materials={materials}
        activeMaterialId={currentMaterial.id}
        onOpenUpload={() => setIsUploadOpen(true)}
        onDeleteMaterial={handleDeleteMaterial}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Module Header */}
        <ModuleHeader material={currentMaterial} />

        {/* Workspace Body */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
          {/* Feature Navigation Tabs */}
          <nav className="flex items-center space-x-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80 w-fit">
            <button
              onClick={() => setActiveFeature("notes")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFeature === "notes"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Short Notes</span>
            </button>

            <button
              onClick={() => setActiveFeature("quiz")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFeature === "quiz"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Quiz Me</span>
            </button>

            <button
              onClick={() => setActiveFeature("feynman")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFeature === "feynman"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Feynman Learning</span>
            </button>

            <button
              onClick={() => setActiveFeature("insights")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFeature === "insights"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Study Insights</span>
            </button>
          </nav>

          {/* Active Feature Content View */}
          <div>
            {activeFeature === "notes" && (
              <ShortNotesTab material={currentMaterial} />
            )}
            {activeFeature === "quiz" && (
              <QuizTab material={currentMaterial} />
            )}
            {activeFeature === "feynman" && (
              <FeynmanTab material={currentMaterial} />
            )}
            {activeFeature === "insights" && (
              <StudyInsightsTab material={currentMaterial} />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newId) => {
          fetchMaterials();
          window.location.href = `/module/${newId}`;
        }}
      />
    </div>
  );
}
