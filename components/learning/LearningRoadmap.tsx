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
      className={`w-72 sm:w-80 h-full min-h-screen bg-[#FDF8F3] border-r border-[#4E342E]/10 flex flex-col justify-between shrink-0 select-none p-5 sm:p-6 font-sans overflow-y-auto min-w-0 ${className}`}
    >
      <div className="flex flex-col gap-6 min-w-0">
        {/* Back to Dashboard Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8D6E63] hover:text-[#4E342E] transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Topic Title & Progress Ratio */}
        <div className="flex flex-col gap-2 min-w-0">
          {modules && modules.length > 0 ? (
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#4E342E] uppercase min-w-0">
              <span className="truncate">Module {currentModuleIndex + 1} of {modules.length}</span>
              <span className="text-[#8D6E63] font-mono text-[10px] shrink-0 ml-2">{currentRatio} concepts</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-[#8D6E63] tracking-wider uppercase truncate">
              {topic}
            </span>
          )}
          <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4E342E] tracking-tight leading-snug break-words min-w-0">
            {topic}
          </h1>

          {/* Progress Bar & Ratio */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-1.5 rounded-full bg-[#4E342E]/10 overflow-hidden">
              <div
                className="h-full bg-[#6B8F71] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[#8D6E63] shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Syllabus Section */}
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-[11px] font-bold tracking-wider text-[#8D6E63] uppercase">
            SYLLABUS
          </span>

          <div className="relative flex flex-col gap-6 pl-1">
            {/* Vertical Connecting Line */}
            {concepts.length > 1 && (
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-[#4E342E]/15 -z-0" />
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
                    className="relative z-10 flex items-center gap-1.5 p-2 bg-white border border-[#4E342E]/20 rounded-xl shadow-xs"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-0.5 text-xs border border-[#4E342E]/20 rounded-lg text-[#4E342E] focus:outline-none focus:border-[#4E342E] font-sans"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-[#6B8F71] hover:bg-[#6B8F71]/10 rounded-md transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-[#8D6E63] hover:bg-[#4E342E]/10 rounded-md transition-colors cursor-pointer"
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
                    className="relative z-10 flex items-center justify-between p-2 bg-[#E57373]/10 border border-[#E57373]/30 rounded-xl text-xs"
                  >
                    <span className="text-[#E57373] font-medium text-[11px] truncate">
                      Delete module?
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleConfirmDelete(concept)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#E57373] text-white rounded-md hover:bg-[#E57373]/90 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-[#4E342E]/10 text-[#4E342E] rounded-md hover:bg-[#4E342E]/20 transition-colors cursor-pointer"
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
                    <div className="relative z-10 pt-2 pb-1 text-[10px] font-bold tracking-wider text-[#4E342E] uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4E342E]" />
                      <span>{conceptModule.name}</span>
                    </div>
                  )}
                  <div className="relative z-10 flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Node Circle */}
                    <div className="shrink-0 pt-0.5">
                      {isMastered ? (
                        <div className="w-6 h-6 rounded-full bg-[#6B8F71] text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-[#4E342E] flex items-center justify-center shadow-2xs">
                          <CircleDot className="w-3.5 h-3.5 text-[#4E342E] fill-[#4E342E]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#4E342E]/5 border border-[#4E342E]/15 text-[#8D6E63]/60 flex items-center justify-center">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Node Details */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                      <span
                        className={`text-xs leading-tight truncate ${
                          isMastered
                            ? "font-semibold text-[#4E342E]"
                            : isCurrent
                            ? "font-bold text-[#4E342E]"
                            : "font-semibold text-[#8D6E63]/60"
                        }`}
                      >
                        {idx + 1}. {concept.name}
                      </span>
                      {concept.description && (
                        <span
                          className={`text-[11px] leading-normal line-clamp-2 ${
                            isCurrent
                              ? "text-[#8D6E63]"
                              : isMastered
                              ? "text-[#8D6E63]"
                              : "text-[#8D6E63]/50"
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
                      className={`p-1 rounded-md hover:bg-[#4E342E]/10 text-[#8D6E63] hover:text-[#4E342E] transition-all cursor-pointer ${
                        isMenuOpen
                          ? "opacity-100 bg-[#4E342E]/10 text-[#4E342E]"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-7 w-28 bg-[#FDF8F3] border border-[#4E342E]/15 rounded-xl shadow-lg z-30 py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartRename(concept)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[#4E342E] hover:bg-[#4E342E]/10 text-left transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-[#8D6E63]" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteConfirmId(concept.id || null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[#E57373] hover:bg-[#E57373]/10 text-left transition-colors cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3 text-[#E57373]" />
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
