"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import Sidebar, { RecentItem, CollectionItem } from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import DrawerOverlay from "@/components/layout/DrawerOverlay";
import LearningInput from "@/components/learning/LearningInput";
import AddToCollectionModal from "./AddToCollectionModal";
import CreateCollectionModal from "./CreateCollectionModal";
import ModuleBuildingProgress from "@/components/learning/ModuleBuildingProgress";
import {
  Folder,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRight,
  BookOpen,
  X,
  Loader2,
  FolderMinus,
} from "lucide-react";

export interface SerializedCollectionSession {
  id: string;
  topic: string;
  status: "in_progress" | "completed";
  mastery: number;
  updatedAt: string;
  createdAt: string;
}

export interface CollectionMetadata {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CollectionDetailViewProps {
  userName: string;
  initialCollection: CollectionMetadata;
  initialSessions: SerializedCollectionSession[];
  initialSidebarCollections: CollectionItem[];
  initialSidebarRecents: RecentItem[];
}

export const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  userName,
  initialCollection,
  initialSessions,
  initialSidebarCollections,
  initialSidebarRecents,
}) => {
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionMetadata>(initialCollection);
  const [sessions, setSessions] = useState<SerializedCollectionSession[]>(initialSessions);
  const [sidebarCollections, setSidebarCollections] = useState<CollectionItem[]>(initialSidebarCollections);
  const [sidebarRecents, setSidebarRecents] = useState<RecentItem[]>(initialSidebarRecents);

  const [isLoading, setIsLoading] = useState(false);
  const [buildingTopic, setBuildingTopic] = useState("");
  const [isModuleReady, setIsModuleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteCollectionModalOpen, setIsDeleteCollectionModalOpen] = useState(false);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  // Edit Collection metadata mode
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDesc, setEditDesc] = useState(collection.description);

  // Topic action state
  const [activeTopicMenuId, setActiveTopicMenuId] = useState<string | null>(null);
  const [addToColSession, setAddToColSession] = useState<{ id: string; topic: string } | null>(null);

  // Start Learning inside collection
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicText,
          collectionId: collection.id,
        }),
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

  const handleSaveCollectionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: editDesc.trim(),
        }),
      });

      const json = await res.json();

      if (res.ok && json.collection) {
        setCollection((prev) => ({
          ...prev,
          name: json.collection.name,
          description: json.collection.description,
        }));
        setSidebarCollections((prev) =>
          prev.map((c) =>
            c.id === collection.id ? { ...c, name: json.collection.name } : c
          )
        );
        setIsEditingCollection(false);
      }
    } catch (err) {
      console.error("Error updating collection:", err);
    }
  };

  const handleDeleteCollectionConfirm = async () => {
    setIsDeletingCollection(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
    } finally {
      setIsDeletingCollection(false);
    }
  };

  const handleRemoveFromCollection = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/learning/sessions/${sessionId}/collection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: null }),
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setCollection((prev) => ({
          ...prev,
          topicCount: Math.max(0, prev.topicCount - 1),
        }));
      }
    } catch (err) {
      console.error("Error removing session from collection:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/learning/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setSidebarRecents((prev) => prev.filter((r) => r.id !== sessionId));
        setCollection((prev) => ({
          ...prev,
          topicCount: Math.max(0, prev.topicCount - 1),
        }));
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Client sign out error:", err);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Server logout error:", err);
    }
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#FDF8F3] font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <MobileHeader
        title={collection.name}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar Drawer */}
      <DrawerOverlay
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="Navigation"
      >
        <Sidebar
          userName={userName}
          recents={sidebarRecents}
          collections={sidebarCollections}
          activeItem={collection.name}
          onSelectItem={(item) => {
            setIsMobileSidebarOpen(false);
            if (typeof item === "string") {
              if (item === "Dashboard" || item === "Home") router.push("/");
            } else if (item.href) {
              router.push(item.href);
            }
          }}
          onNewCollection={() => {
            setIsMobileSidebarOpen(false);
            setIsCreateModalOpen(true);
          }}
          onRenameRecent={async (item, newTitle) => {
            if (item.id && !item.id.startsWith("recent-")) {
              await fetch(`/api/learning/sessions/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: newTitle }),
              });
              setSessions((prev) =>
                prev.map((s) => (s.id === item.id ? { ...s, topic: newTitle } : s))
              );
            }
            setSidebarRecents((prev) =>
              prev.map((r) => (r.id === item.id ? { ...r, title: newTitle } : r))
            );
          }}
          onDeleteRecent={async (item) => {
            if (item.id && !item.id.startsWith("recent-")) {
              await fetch(`/api/learning/sessions/${item.id}`, { method: "DELETE" });
            }
            setSidebarRecents((prev) => prev.filter((r) => r.id !== item.id));
          }}
          onRenameCollection={async (item, newName) => {
            if (item.id) {
              await fetch(`/api/collections/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
              });
              if (item.id === collection.id) {
                setCollection((prev) => ({ ...prev, name: newName }));
              }
            }
            setSidebarCollections((prev) =>
              prev.map((c) => (c.id === item.id ? { ...c, name: newName } : c))
            );
          }}
          onDeleteCollection={async (item) => {
            if (item.id) {
              await fetch(`/api/collections/${item.id}`, { method: "DELETE" });
              if (item.id === collection.id) {
                router.push("/");
              }
            }
            setSidebarCollections((prev) => prev.filter((c) => c.id !== item.id));
          }}
          className="w-full border-r-0 h-full"
        />
      </DrawerOverlay>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar
          userName={userName}
          recents={sidebarRecents}
          collections={sidebarCollections}
          activeItem={collection.name}
          onSelectItem={(item) => {
            if (typeof item === "string") {
              if (item === "Dashboard" || item === "Home") router.push("/");
            } else if (item.href) {
              router.push(item.href);
            }
          }}
          onNewCollection={() => setIsCreateModalOpen(true)}
          onRenameRecent={async (item, newTitle) => {
            if (item.id && !item.id.startsWith("recent-")) {
              await fetch(`/api/learning/sessions/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: newTitle }),
              });
              setSessions((prev) =>
                prev.map((s) => (s.id === item.id ? { ...s, topic: newTitle } : s))
              );
            }
            setSidebarRecents((prev) =>
              prev.map((r) => (r.id === item.id ? { ...r, title: newTitle } : r))
            );
          }}
          onDeleteRecent={async (item) => {
            if (item.id && !item.id.startsWith("recent-")) {
              await fetch(`/api/learning/sessions/${item.id}`, { method: "DELETE" });
            }
            setSidebarRecents((prev) => prev.filter((r) => r.id !== item.id));
          }}
          onRenameCollection={async (item, newName) => {
            if (item.id) {
              await fetch(`/api/collections/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
              });
              if (item.id === collection.id) {
                setCollection((prev) => ({ ...prev, name: newName }));
              }
            }
            setSidebarCollections((prev) =>
              prev.map((c) => (c.id === item.id ? { ...c, name: newName } : c))
            );
          }}
          onDeleteCollection={async (item) => {
            if (item.id) {
              await fetch(`/api/collections/${item.id}`, { method: "DELETE" });
              if (item.id === collection.id) {
                router.push("/");
              }
            }
            setSidebarCollections((prev) => prev.filter((c) => c.id !== item.id));
          }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-10 min-w-0 max-w-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 min-w-0">
          {/* Header Card */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl bg-white border border-[#4E342E]/10 shadow-xs relative min-w-0">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 min-w-0">
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#4E342E] text-white shadow-xs shrink-0">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                </div>

                {isEditingCollection ? (
                  <form
                    onSubmit={handleSaveCollectionEdit}
                    className="flex flex-col gap-2 flex-1 max-w-md min-w-0"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3.5 py-1.5 text-lg sm:text-xl font-bold border border-[#4E342E]/30 rounded-xl text-[#4E342E] bg-white focus:outline-none focus:ring-2 focus:ring-[#4E342E]/15 font-sans"
                      autoFocus
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Add a description..."
                      rows={2}
                      className="px-3.5 py-1.5 text-xs border border-[#4E342E]/20 rounded-xl text-[#4E342E] bg-white focus:outline-none focus:ring-2 focus:ring-[#4E342E]/15 resize-none font-sans"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#4E342E] text-white rounded-xl hover:bg-[#3D2924] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingCollection(false)}
                        className="px-3.5 py-1.5 text-xs font-medium bg-[#4E342E]/5 text-[#4E342E] rounded-xl hover:bg-[#4E342E]/10 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-[#4E342E] tracking-tight break-words min-w-0">
                        {collection.name}
                      </h1>
                      <button
                        onClick={() => {
                          setEditName(collection.name);
                          setEditDesc(collection.description);
                          setIsEditingCollection(true);
                        }}
                        className="p-1 text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Edit Collection"
                      >
                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    {collection.description && (
                      <p className="text-xs text-[#8D6E63] max-w-xl break-words min-w-0">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#4E342E]/5 text-[#4E342E] border border-[#4E342E]/10 shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-[#8D6E63]" />
                        {sessions.length}{" "}
                        {sessions.length === 1 ? "topic" : "topics"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Collection Action Options */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => setIsDeleteCollectionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#E57373] hover:bg-[#E57373]/10 border border-[#E57373]/30 rounded-xl transition-colors cursor-pointer"
                  title="Delete Collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Collection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Start Learning Input Banner */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-[#8D6E63] tracking-wide uppercase">
              Learn something new in {collection.name}
            </h2>
            <LearningInput
              onStartLearning={handleStartLearning}
              isLoading={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#E57373]" />
              <span>{error}</span>
            </div>
          )}

          {/* Topics List / Cards */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#4E342E] tracking-tight">
                Topics ({sessions.length})
              </h2>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-[#4E342E]/20 bg-white text-center gap-3">
                <div className="p-3 rounded-xl bg-[#4E342E]/5 text-[#4E342E]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-[#4E342E]">
                    This collection is empty
                  </h3>
                  <p className="text-xs text-[#8D6E63] max-w-sm">
                    Enter a topic in the input above to start learning inside{" "}
                    <span className="font-semibold text-[#4E342E]">
                      {collection.name}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((s) => {
                  const isComplete = s.status === "completed";
                  const isMenuOpen = activeTopicMenuId === s.id;

                  return (
                    <div
                      key={s.id}
                      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-[#4E342E]/10 bg-white hover:border-[#4E342E]/30 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/learn/${s.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                          <h3 className="font-semibold text-[#4E342E] text-sm sm:text-base group-hover:text-[#6D4C41] transition-colors truncate">
                            {s.topic}
                          </h3>
                          <div className="flex items-center gap-2">
                            {isComplete ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B8F71] bg-[#6B8F71]/10 px-2.5 py-0.5 rounded-lg border border-[#6B8F71]/30">
                                <CheckCircle2 className="w-3 h-3" /> Mastered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4E342E] bg-[#4E342E]/5 px-2.5 py-0.5 rounded-lg border border-[#4E342E]/15">
                                Active
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Topic 3-dots Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTopicMenuId(isMenuOpen ? null : s.id);
                            }}
                            className="p-1 rounded-lg hover:bg-[#4E342E]/10 text-[#8D6E63] hover:text-[#4E342E] transition-colors cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute right-0 top-7 w-44 bg-[#FDF8F3] border border-[#4E342E]/15 rounded-xl shadow-lg z-30 py-1 text-xs font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTopicMenuId(null);
                                  handleRemoveFromCollection(s.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[#4E342E] hover:bg-[#4E342E]/10 text-left transition-colors cursor-pointer"
                              >
                                <FolderMinus className="w-3.5 h-3.5 text-[#8D6E63]" />
                                <span>Remove from Collection</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTopicMenuId(null);
                                  handleDeleteSession(s.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[#E57373] hover:bg-[#E57373]/10 text-left transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#E57373]" />
                                <span>Delete Session</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#4E342E]/10 text-[11px] text-[#8D6E63]">
                        <span suppressHydrationWarning>
                          Updated{" "}
                          {new Date(s.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#4E342E] group-hover:translate-x-0.5 transition-transform">
                          Continue <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Collection Modal */}
      {isDeleteCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FDF8F3] rounded-2xl shadow-2xl border border-[#4E342E]/15 p-5 sm:p-6 flex flex-col gap-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#4E342E] text-sm">
                Delete Collection?
              </h3>
              <button
                onClick={() => setIsDeleteCollectionModalOpen(false)}
                className="p-1 rounded-lg text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8D6E63] leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#4E342E]">
                &ldquo;{collection.name}&rdquo;
              </span>
              ? Your topics inside this collection will not be deleted.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteCollectionModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollectionConfirm}
                disabled={isDeletingCollection}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#E57373] hover:bg-[#E57373]/90 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeletingCollection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newCol) => {
          setSidebarCollections((prev) => [
            { id: newCol.id, name: newCol.name, href: `/collections/${newCol.id}` },
            ...prev,
          ]);
        }}
      />

      {addToColSession && (
        <AddToCollectionModal
          isOpen={!!addToColSession}
          sessionId={addToColSession.id}
          sessionTopic={addToColSession.topic}
          currentCollectionId={collection.id}
          onClose={() => setAddToColSession(null)}
          onSuccess={() => {}}
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

export default CollectionDetailView;
