"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Plus,
  BookOpen,
  FileText,
  Settings,
  Trash2,
  Sparkles,
} from "lucide-react";
import { IStudyMaterial } from "@/lib/db/models";

interface SidebarProps {
  materials: IStudyMaterial[];
  activeMaterialId?: string;
  onOpenUpload: () => void;
  onDeleteMaterial?: (id: string) => void;
}

export function Sidebar({
  materials,
  activeMaterialId,
  onOpenUpload,
  onDeleteMaterial,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 text-zinc-300 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Section */}
      <div className="flex flex-col space-y-4 p-4 overflow-hidden">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 px-2 py-1 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">
                Skooler AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Study Workspace</p>
          </div>
        </Link>

        {/* Upload Action Button */}
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Material</span>
        </button>

        <div className="h-px bg-zinc-800/80 my-1" />

        {/* Study Materials List */}
        <div className="space-y-1 overflow-y-auto pr-1 max-h-[calc(100vh-260px)]">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Study Materials</span>
            <span className="text-zinc-600">{materials.length}</span>
          </div>

          {materials.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl mt-2">
              <BookOpen className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-zinc-400" />
              <p>No materials yet.</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Upload a PDF or DOCX</p>
            </div>
          ) : (
            materials.map((item) => {
              const isActive = activeMaterialId === item.id;
              const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all ${
                    isActive
                      ? "bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Link
                    href={`/module/${item.id}`}
                    className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2"
                  >
                    <FileText
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{item.title}</p>
                      <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500">
                        <span className="truncate max-w-[90px]">{item.subject}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </Link>

                  {onDeleteMaterial && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (confirm(`Delete "${item.title}"?`)) {
                          onDeleteMaterial(item.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-500 transition-opacity cursor-pointer"
                      title="Delete material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">RAG Engine</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        <button
          onClick={() => alert("Skooler AI Platform v2.0 - Active Recall & Feynman Learning")}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
