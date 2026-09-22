"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { RecentItem, CollectionItem } from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import DrawerOverlay from "@/components/layout/DrawerOverlay";
import LearningInput from "@/components/learning/LearningInput";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import AddToCollectionModal from "@/components/collections/AddToCollectionModal";
import ModuleBuildingProgress from "@/components/learning/ModuleBuildingProgress";
import {
  Plus,
  AlertCircle,
  ArrowRight,
  Folder,
  Sprout,
  Sparkles,
} from "lucide-react";

export interface DashboardCollectionItem {
  id: string;
  name: string;
  description?: string;
  topicCount?: number;
  progress?: number | null;
  lastStudied?: string;
  updatedAt?: string;
}

interface DashboardViewProps {
  userName: string;
  initialSessions: Array<{
    id: string;
    topic: string;
    mastery?: number | null;
    status?: string;
    updatedAt?: string;
  }>;
  initialCollections?: DashboardCollectionItem[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const getRelativeTimeAgo = (date?: string) => {
  if (!date) return "Recently";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Recently";
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  initialSessions,
  initialCollections = [],
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [buildingTopic, setBuildingTopic] = useState("");
  const [isModuleReady, setIsModuleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [recentsList, setRecentsList] = useState<RecentItem[]>(() =>
    initialSessions.map((s) => ({
      id: s.id,
      title: s.topic,
      href: `/learn/${s.id}`,
      timeAgo: getRelativeTimeAgo(s.updatedAt),
      mastery: s.mastery ?? null,
      status: s.status,
    }))
  );

  const [collectionsList, setCollectionsList] = useState<DashboardCollectionItem[]>(
    initialCollections
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addToColSession, setAddToColSession] = useState<RecentItem | null>(null);

  const handleStartLearning = async (data: { text: string; files: File[] }) => {
    const topicText = data.text.trim();
    if (!topicText) return;

    setBuildingTopic(topicText);
    setIsLoading(true);
    setIsModuleReady(false);
    setError(null);

    try {
      const res = await fetch("/api/learning/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicText }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to start learning session");
      }

      if (json.sessionId) {
        setIsModuleReady(true);
        setTimeout(() => {
          router.push(`/learn/${json.sessionId}`);
        }, 600);
      } else {
        throw new Error("No session ID returned");
      }
    } catch (err) {
      console.error("Error starting learning session:", err);
      setError((err as Error).message || "An unexpected error occurred.");
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

  const getRecentIcon = () => (
    <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
      <Sprout className="w-4 h-4" />
    </div>
  );

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
              {collectionsList.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 p-4 rounded-md border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    No collections yet — create one to organize your learning topics.
                  </span>
                </div>
              )}
              {collectionsList.map((col) => {
                const hasProgress = typeof col.progress === "number" && col.progress > 0;
                const progress = hasProgress ? Math.min(100, Math.max(0, col.progress!)) : 0;
                const lastStudied =
                  col.topicCount && col.topicCount > 0
                    ? `Last studied ${col.lastStudied || getRelativeTimeAgo(col.updatedAt)}`
                    : "No topics yet";

                return (
                  <div
                    key={col.id}
                    onClick={() => router.push(`/collections/${col.id}`)}
                    className="group p-4 sm:p-5 rounded-md border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[170px] min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                        <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        <span
                          className="text-slate-400 text-[11px] truncate pr-2"
                          suppressHydrationWarning
                        >
                          {lastStudied}
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
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Recently Studied
            </h2>

            {recentsList.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-md border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Nothing here yet — type any topic above to start your first
                  learning session.
                </span>
              </div>
            ) : (
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
                    {getRecentIcon()}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {item.title}
                      </h4>
                      {item.timeAgo && (
                        <p
                          className="text-[11px] text-slate-400 sm:hidden"
                          suppressHydrationWarning
                        >
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
                    <span
                      className="hidden sm:inline text-xs text-slate-400 text-right shrink-0"
                      suppressHydrationWarning
                    >
                      {item.timeAgo || "Recently"}
                    </span>

                    {/* Right Arrow */}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
              </div>
            )}
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

      {/* AI Module Generation Progress Modal */}
      <ModuleBuildingProgress
        isOpen={isLoading}
        topic={buildingTopic}
        mode="modal"
        type="new_module"
        isCompleted={isModuleReady}
        error={error}
        onClose={() => {
          setIsLoading(false);
          setError(null);
        }}
      />
    </div>
  );
};

export default DashboardView;
