"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { RecentItem, CollectionItem } from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import DrawerOverlay from "@/components/layout/DrawerOverlay";
import LearningInput from "@/components/learning/LearningInput";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import AddToCollectionModal from "@/components/collections/AddToCollectionModal";
import {
  Plus,
  AlertCircle,
  ArrowRight,
  Code2,
  BookOpen,
  Folder,
  Monitor,
  Sprout,
} from "lucide-react";

export interface DashboardCollectionItem {
  id: string;
  name: string;
  description?: string;
  topicCount?: number;
  progress?: number | null;
  lastStudied?: string;
}

interface DashboardViewProps {
  userName: string;
  initialSessions: Array<{ id: string; topic: string }>;
  initialCollections?: DashboardCollectionItem[];
}

const DEFAULT_MOCK_RECENTS: RecentItem[] = [
  { id: "1", title: "Stoicism", timeAgo: "Today" },
  { id: "2", title: "Operating Systems", timeAgo: "Yesterday" },
  { id: "3", title: "Pragmatism", timeAgo: "2 days ago" },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  initialSessions,
  initialCollections = [],
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [recentsList, setRecentsList] = useState<RecentItem[]>(() =>
    initialSessions.length > 0
      ? initialSessions.map((s) => ({
          id: s.id,
          title: s.topic,
          href: `/learn/${s.id}`,
          timeAgo: "Recently",
        }))
      : DEFAULT_MOCK_RECENTS
  );

  const [collectionsList, setCollectionsList] = useState<DashboardCollectionItem[]>(
    initialCollections.length > 0
      ? initialCollections
      : [
          { id: "c1", name: "Learnings", topicCount: 12, lastStudied: "2h ago" },
          { id: "c2", name: "Web Development", topicCount: 8, lastStudied: "today" },
        ]
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addToColSession, setAddToColSession] = useState<RecentItem | null>(null);

  const handleStartLearning = async (data: { text: string; files: File[] }) => {
    if (!data.text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/learning/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: data.text.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to start learning session");
      }

      if (json.sessionId) {
        router.push(`/learn/${json.sessionId}`);
      } else {
        throw new Error("No session ID returned");
      }
    } catch (err) {
      console.error("Error starting learning session:", err);
      setError((err as Error).message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleSelectItem = (item: string | RecentItem | CollectionItem) => {
    if (
      typeof item === "object" &&
      item.id &&
      !item.id.startsWith("recent-") &&
      !item.id.startsWith("col-")
    ) {
      if (item.href) {
        router.push(item.href);
      } else {
        router.push(`/learn/${item.id}`);
      }
    } else if (item === "Dashboard") {
      router.push("/");
    }
  };

  const handleRenameRecent = async (item: RecentItem, newTitle: string) => {
    if (item.id && !item.id.startsWith("recent-") && item.id.length > 5) {
      try {
        await fetch(`/api/learning/sessions/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: newTitle }),
        });
      } catch (err) {
        console.error("Error renaming session:", err);
      }
    }

    setRecentsList((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, title: newTitle } : r))
    );
  };

  const handleDeleteRecent = async (item: RecentItem) => {
    if (item.id && !item.id.startsWith("recent-") && item.id.length > 5) {
      try {
        await fetch(`/api/learning/sessions/${item.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }

    setRecentsList((prev) => prev.filter((r) => r.id !== item.id));
  };

  const handleRenameCollection = async (item: CollectionItem, newName: string) => {
    if (item.id && !item.id.startsWith("col-")) {
      try {
        await fetch(`/api/collections/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
      } catch (err) {
        console.error("Error renaming collection:", err);
      }
    }
    setCollectionsList((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, name: newName } : c))
    );
  };

  const handleDeleteCollection = async (item: CollectionItem) => {
    if (item.id && !item.id.startsWith("col-")) {
      try {
        await fetch(`/api/collections/${item.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error deleting collection:", err);
      }
    }
    setCollectionsList((prev) => prev.filter((c) => c.id !== item.id));
  };

  const sidebarCollections: CollectionItem[] = collectionsList.map((c) => ({
    id: c.id,
    name: c.name,
    href: `/collections/${c.id}`,
  }));

  // Utility icons for recent items
  const getRecentIcon = (title: string, index: number) => {
    const lower = title.toLowerCase();
    if (lower.includes("operating") || lower.includes("system") || lower.includes("web") || lower.includes("tech")) {
      return (
        <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Monitor className="w-4 h-4" />
        </div>
      );
    }
    if (lower.includes("pragmatism") || lower.includes("read") || lower.includes("book") || lower.includes("history")) {
      return (
        <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        <Sprout className="w-4 h-4" />
      </div>
    );
  };

  const getRecentProgressBarColor = (index: number) => {
    const colors = ["bg-emerald-500", "bg-amber-500", "bg-indigo-600"];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f9fafb] font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <MobileHeader
        title="Dashboard"
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      {/* Mobile Sidebar Drawer Overlay */}
      <DrawerOverlay
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="Navigation"
      >
        <Sidebar
          userName={userName}
          recents={recentsList}
          collections={sidebarCollections}
          activeItem="Dashboard"
          onSelectItem={(item) => {
            setIsMobileSidebarOpen(false);
            handleSelectItem(item);
          }}
          onNewCollection={() => {
            setIsMobileSidebarOpen(false);
            setIsCreateModalOpen(true);
          }}
          onRenameRecent={handleRenameRecent}
          onDeleteRecent={handleDeleteRecent}
          onAddToCollection={(item) => {
            setIsMobileSidebarOpen(false);
            setAddToColSession(item);
          }}
          onRenameCollection={handleRenameCollection}
          onDeleteCollection={handleDeleteCollection}
          onNewLearning={() => {}}
          className="w-full border-r-0 h-full"
        />
      </DrawerOverlay>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar
          userName={userName}
          recents={recentsList}
          collections={sidebarCollections}
          activeItem="Dashboard"
          onSelectItem={handleSelectItem}
          onNewCollection={() => setIsCreateModalOpen(true)}
          onRenameRecent={handleRenameRecent}
          onDeleteRecent={handleDeleteRecent}
          onAddToCollection={(item) => setAddToColSession(item)}
          onRenameCollection={handleRenameCollection}
          onDeleteCollection={handleDeleteCollection}
          onNewLearning={() => {}}
        />
      </div>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-10 min-w-0 max-w-full overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col gap-6 sm:gap-9 py-2 sm:py-4 min-w-0">
          {/* Greeting Header */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">
              Good to see you, {userName}.
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight break-words">
              What do you want to understand?
            </h1>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="break-words min-w-0 flex-1">{error}</span>
            </div>
          )}

          {/* Learning Prompt Input */}
          <LearningInput
            onStartLearning={handleStartLearning}
            isLoading={isLoading}
          />

          {/* YOUR COLLECTIONS Section */}
          <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                Your Collections
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New collection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              {collectionsList.map((col) => {
                const isWebDev = col.name.toLowerCase().includes("web");
                const hasProgress = typeof col.progress === "number" && col.progress > 0;
                const progress = hasProgress ? Math.min(100, Math.max(0, col.progress!)) : 0;
                const lastStudied = col.lastStudied || "recently";

                return (
                  <div
                    key={col.id}
                    onClick={() => router.push(`/collections/${col.id}`)}
                    className="group p-4 sm:p-5 rounded-md border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[170px] min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                        {isWebDev ? <Code2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Folder className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors truncate">
                        {col.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {col.topicCount || 0} {col.topicCount === 1 ? "topic" : "topics"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 min-w-0">
                      {/* Real Progress bar if available */}
                      {hasProgress && (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-0">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500 shrink-0">
                            {progress}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs min-w-0">
                        <span className="text-slate-400 text-[11px] truncate pr-2">
                          Last studied {lastStudied}
                        </span>
                        <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* New Collection Dashed Card */}
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="border-2 border-dashed border-indigo-200/90 rounded-md bg-indigo-50/20 p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all min-h-[160px] sm:min-h-[170px] min-w-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate max-w-full">New collection</h4>
                <p className="text-xs text-slate-400 max-w-[160px] mt-0.5 leading-relaxed">
                  Organize your learnings in one place
                </p>
              </div>
            </div>
          </div>

          {/* RECENTLY STUDIED Section */}
          <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                Recently Studied
              </h2>

              <button
                type="button"
                onClick={() => {}}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer shrink-0"
              >
                View all
              </button>
            </div>

            <div className="bg-white rounded-md border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100 min-w-0">
              {recentsList.map((item, idx) => {
                const hasMastery = typeof item.mastery === "number" && item.mastery > 0;
                const masteryVal = hasMastery ? Math.min(100, Math.max(0, item.mastery!)) : 0;
                const barColor = getRecentProgressBarColor(idx);

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectItem(item)}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors flex items-center gap-3 sm:gap-4 cursor-pointer group min-w-0"
                  >
                    {getRecentIcon(item.title, idx)}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.title}
                      </h4>
                      {item.timeAgo && (
                        <p className="text-[11px] text-slate-400 sm:hidden">
                          {item.timeAgo}
                        </p>
                      )}
                    </div>

                    {/* Real Progress Bar & Percentage if available */}
                    {hasMastery && (
                      <div className="hidden sm:flex w-28 md:w-44 flex items-center gap-2.5 shrink-0">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-0">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${masteryVal}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 shrink-0">
                          {masteryVal}%
                        </span>
                      </div>
                    )}

                    {/* Relative Date (desktop) */}
                    <span className="hidden sm:inline text-xs text-slate-400 text-right shrink-0">
                      {item.timeAgo || "Recently"}
                    </span>

                    {/* Right Arrow */}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newCol) => {
          setCollectionsList((prev) => [newCol, ...prev]);
        }}
      />

      {addToColSession && (
        <AddToCollectionModal
          isOpen={!!addToColSession}
          sessionId={addToColSession.id || ""}
          sessionTopic={addToColSession.title}
          currentCollectionId={addToColSession.collectionId}
          onClose={() => setAddToColSession(null)}
          onSuccess={(updatedColId) => {
            setRecentsList((prev) =>
              prev.map((r) =>
                r.id === addToColSession.id
                  ? { ...r, collectionId: updatedColId }
                  : r
              )
            );
          }}
          onOpenCreateCollection={() => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  );
};

export default DashboardView;
