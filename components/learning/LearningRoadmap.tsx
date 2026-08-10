"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Lock,
  CircleDot,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Concept, LearningModule } from "@/lib/ai/types";

interface LearningRoadmapProps {
  topic: string;
  concepts: Concept[];
  modules?: LearningModule[];
  currentConceptIndex: number;
  currentModuleIndex?: number;
  isComplete?: boolean;
  onRenameConcept?: (concept: Concept, newName: string) => void | Promise<void>;
  onDeleteConcept?: (concept: Concept) => void | Promise<void>;
  className?: string;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({
  topic,
  concepts: initialConcepts,
  modules,
  currentConceptIndex,
  currentModuleIndex = 0,
  isComplete = false,
  onRenameConcept,
  onDeleteConcept,
  className = "",
}) => {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConcepts(initialConcepts);
  }, [initialConcepts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalConcepts = Math.max(1, concepts.length);
  const completedCount = isComplete
    ? totalConcepts
    : concepts.filter((c) => c.status === "mastered").length;

  const currentRatio = `${Math.min(
    completedCount + (isComplete ? 0 : 1),
    totalConcepts
  )} / ${totalConcepts}`;
  const progressPercent = Math.min(
    100,
    Math.round(
      ((completedCount + (isComplete ? 0 : 0.5)) / totalConcepts) * 100
    )
  );

  const handleStartRename = (concept: Concept) => {
    setActiveMenuId(null);
    setEditingId(concept.id);
    setEditValue(concept.name);
  };

  const handleSaveRename = async (concept: Concept) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== concept.name) {
      if (onRenameConcept) {
        await onRenameConcept(concept, trimmed);
      } else {
        setConcepts((prev) =>
          prev.map((c) => (c.id === concept.id ? { ...c, name: trimmed } : c))
        );
      }
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleConfirmDelete = async (concept: Concept) => {
    if (onDeleteConcept) {
      await onDeleteConcept(concept);
    } else {
      setConcepts((prev) => prev.filter((c) => c.id !== concept.id));
    }
    setDeleteConfirmId(null);
  };

  return (
    <aside
      ref={containerRef}
      className={`w-72 sm:w-80 h-full min-h-screen bg-white border-r border-slate-100/90 flex flex-col justify-between shrink-0 select-none p-5 sm:p-6 font-sans overflow-y-auto min-w-0 ${className}`}
    >
      <div className="flex flex-col gap-6 min-w-0">
        {/* Back to Dashboard Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Topic Title & Progress Ratio */}
        <div className="flex flex-col gap-2 min-w-0">
          {modules && modules.length > 0 ? (
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-indigo-700 uppercase min-w-0">
              <span className="truncate">Module {currentModuleIndex + 1} of {modules.length}</span>
              <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">{currentRatio} concepts</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
              {topic}
            </span>
          )}
          <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug break-words min-w-0">
            {topic}
          </h1>

          {/* Progress Bar & Ratio */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-400 shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            SYLLABUS
          </span>

          <div className="relative flex flex-col gap-6 pl-1">
            {/* Vertical Connecting Line */}
            {concepts.length > 1 && (
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-200 -z-0" />
            )}

            {concepts.map((concept, idx) => {
              const isMastered =
                isComplete ||
                concept.status === "mastered" ||
                idx < currentConceptIndex;
              const isCurrent = !isComplete && idx === currentConceptIndex;
              const isEditing = editingId === concept.id;
              const isDeleting = deleteConfirmId === concept.id;
              const isMenuOpen = activeMenuId === concept.id;

              const conceptModule = modules?.find(
                (m) => m.id === concept.moduleId || m.concepts?.some((c) => c.id === concept.id)
              );
              const prevConcept = idx > 0 ? concepts[idx - 1] : null;
              const prevModule = prevConcept
                ? modules?.find(
                    (m) => m.id === prevConcept.moduleId || m.concepts?.some((c) => c.id === prevConcept.id)
                  )
                : null;
              const isNewModule = conceptModule && (!prevModule || prevModule.id !== conceptModule.id);

              if (isEditing) {
                return (
                  <form
                    key={concept.id || idx}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveRename(concept);
                    }}
                    className="relative z-10 flex items-center gap-1.5 p-2 bg-white border border-indigo-200 rounded-md shadow-xs"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-0.5 text-xs border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                );
              }

              if (isDeleting) {
                return (
                  <div
                    key={concept.id || idx}
                    className="relative z-10 flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md text-xs"
                  >
                    <span className="text-red-700 font-medium text-[11px] truncate">
                      Delete module?
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleConfirmDelete(concept)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={concept.id || idx}>
                  {isNewModule && conceptModule && (
                    <div className="relative z-10 pt-2 pb-1 text-[10px] font-bold tracking-wider text-indigo-600 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>{conceptModule.name}</span>
                    </div>
                  )}
                  <div className="relative z-10 flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Node Circle */}
                    <div className="shrink-0 pt-0.5">
                      {isMastered ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-50/50 border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                          <CircleDot className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Node Details */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                      <span
                        className={`text-xs leading-tight truncate ${
                          isMastered
                            ? "font-semibold text-slate-900"
                            : isCurrent
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-400"
                        }`}
                      >
                        {idx + 1}. {concept.name}
                      </span>
                      {concept.description && (
                        <span
                          className={`text-[11px] leading-normal line-clamp-2 ${
                            isCurrent
                              ? "text-slate-500"
                              : isMastered
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {concept.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3-Dots Menu Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          isMenuOpen ? null : concept.id || null
                        );
                      }}
                      className={`p-1 rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-all cursor-pointer ${
                        isMenuOpen
                          ? "opacity-100 bg-slate-200/80 text-slate-700"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-7 w-28 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartRename(concept)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteConfirmId(concept.id || null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LearningRoadmap;
