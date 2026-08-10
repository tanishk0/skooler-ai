"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut } from "@/lib/auth-client";
import {
  Bot,
  LayoutDashboard,
  Plus,
  ChevronRight,
  Settings,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  FolderPlus,
  FolderInput,
  Folder,
  Clock,
  LogOut,
  ChevronDown,
} from "lucide-react";

export interface RecentItem {
  id?: string;
  title: string;
  href?: string;
  collectionId?: string | null;
  timeAgo?: string;
  mastery?: number | null;
  status?: string;
}

export interface CollectionItem {
  id?: string;
  name: string;
  href?: string;
}

export interface SidebarProps {
  userName?: string;
  activeItem?: string;
  recents?: (string | RecentItem)[];
  collections?: (string | CollectionItem)[];
  onSelectItem?: (item: string | RecentItem | CollectionItem) => void;
  onNewLearning?: () => void;
  onNewCollection?: () => void;
  onLogout?: () => void | Promise<void>;
  onRenameRecent?: (item: RecentItem, newTitle: string) => void | Promise<void>;
  onDeleteRecent?: (item: RecentItem) => void | Promise<void>;
  onAddToCollection?: (item: RecentItem) => void | Promise<void>;
  onRenameCollection?: (item: CollectionItem, newName: string) => void | Promise<void>;
  onDeleteCollection?: (item: CollectionItem) => void | Promise<void>;
  className?: string;
}

const DEFAULT_RECENTS: RecentItem[] = [
  { id: "1", title: "fashion and personal styling", timeAgo: "12 min ago" },
  { id: "2", title: "pragmatism", timeAgo: "Yesterday" },
  { id: "3", title: "Operating Systems", timeAgo: "Yesterday" },
  { id: "4", title: "Stoicism", timeAgo: "2 days ago" },
];

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  { id: "c1", name: "Learnings" },
  { id: "c2", name: "Web Development" },
  { id: "c3", name: "Philosophy" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  userName = "tani",
  activeItem = "Dashboard",
  recents = DEFAULT_RECENTS,
  collections = DEFAULT_COLLECTIONS,
  onSelectItem,
  onNewLearning,
  onNewCollection,
  onLogout,
  onRenameRecent,
  onDeleteRecent,
  onAddToCollection,
  onRenameCollection,
  onDeleteCollection,
  className = "",
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedRecents: RecentItem[] = recents.map((item, index) => {
    if (typeof item === "string") {
      return { id: `recent-${index}-${item}`, title: item, timeAgo: "Recently" };
    }
    return {
      id: item.id || `recent-${index}-${item.title}`,
      title: item.title,
      href: item.href,
      collectionId: item.collectionId,
      timeAgo: item.timeAgo || "Recently",
      mastery: item.mastery,
      status: item.status,
    };
  });

  const normalizedCollections: CollectionItem[] = collections.map(
    (item, index) => {
      if (typeof item === "string") {
        return { id: `col-${index}-${item}`, name: item };
      }
      return {
        id: item.id || `col-${index}-${item.name}`,
        name: item.name,
        href: item.href || `/collections/${item.id}`,
      };
    }
  );

  const handleStartRenameRecent = (item: RecentItem) => {
    setActiveMenuId(null);
    setEditingId(item.id || null);
    setEditValue(item.title);
  };

  const handleSaveRenameRecent = async (item: RecentItem) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.title) {
      await onRenameRecent?.(item, trimmed);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleConfirmDeleteRecent = async (item: RecentItem) => {
    await onDeleteRecent?.(item);
    setDeleteConfirmId(null);
  };

  const handleStartRenameCollection = (item: CollectionItem) => {
    setActiveMenuId(null);
    setEditingId(item.id || null);
    setEditValue(item.name);
  };

  const handleSaveRenameCollection = async (item: CollectionItem) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name) {
      await onRenameCollection?.(item, trimmed);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleConfirmDeleteCollection = async (item: CollectionItem) => {
    await onDeleteCollection?.(item);
    setDeleteConfirmId(null);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      try {
        await signOut();
      } catch (err) {
        console.error("Error logging out:", err);
      }
      window.location.href = "/login";
    }
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <aside
      ref={containerRef}
      className={`w-64 h-full min-h-screen bg-white border-r border-slate-100/90 flex flex-col justify-between select-none shrink-0 font-sans text-sm text-slate-700 ${className}`}
    >
      {/* Header & Main Nav */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Skooler <span className="text-indigo-600">AI</span>
          </span>
        </div>

        {/* Navigation Content */}
        <div className="px-3 py-2 flex flex-col gap-6">
          {/* Main Item: Dashboard */}
          <div>
            <button
              onClick={() => onSelectItem?.("Dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all cursor-pointer text-sm font-semibold ${
                activeItem === "Dashboard"
                  ? "bg-indigo-50/80 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Collections Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <span>Collections</span>
              {onNewCollection && (
                <button
                  onClick={onNewCollection}
                  title="Create New Collection"
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              {normalizedCollections.map((collection) => {
                const isSelected =
                  activeItem === collection.name || activeItem === collection.id;
                const isEditing = editingId === collection.id;
                const isDeleting = deleteConfirmId === collection.id;
                const isMenuOpen = activeMenuId === collection.id;

                if (isEditing) {
                  return (
                    <form
                      key={collection.id}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveRenameCollection(collection);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-indigo-200 rounded-md"
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
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
                      key={collection.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-md text-xs"
                    >
                      <span className="text-red-700 font-medium text-[11px] truncate">
                        Delete?
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleConfirmDeleteCollection(collection)}
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
                  <div
                    key={collection.id}
                    className="relative group flex items-center justify-between w-full"
                  >
                    <button
                      onClick={() => onSelectItem?.(collection)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/80 text-indigo-900 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-4">
                        <Folder className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        <span className="truncate">{collection.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Three Dots Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : collection.id || null);
                      }}
                      className={`absolute right-1.5 p-1 rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-all cursor-pointer ${
                        isMenuOpen ? "opacity-100 bg-slate-200/80 text-slate-700" : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-8 w-32 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartRenameCollection(collection)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteConfirmId(collection.id || null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Studied Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <span>Recently Studied</span>
              {onNewLearning && (
                <button
                  onClick={onNewLearning}
                  title="Start new learning"
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              {normalizedRecents.map((item) => {
                const isSelected =
                  activeItem === item.title || activeItem === item.id;
                const isEditing = editingId === item.id;
                const isDeleting = deleteConfirmId === item.id;
                const isMenuOpen = activeMenuId === item.id;

                if (isEditing) {
                  return (
                    <form
                      key={item.id}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveRenameRecent(item);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-indigo-200 rounded-md"
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-indigo-500 font-sans"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
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
                      key={item.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-md text-xs"
                    >
                      <span className="text-red-700 font-medium text-[11px] truncate">
                        Delete?
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleConfirmDeleteRecent(item)}
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
                  <div
                    key={item.id}
                    className="relative group flex items-center justify-between w-full"
                  >
                    <button
                      onClick={() => onSelectItem?.(item)}
                      className={`w-full flex items-start gap-3 px-3 py-2 rounded-md text-xs transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-slate-100 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col min-w-0 flex-1 pr-4">
                        <span className="truncate text-slate-800 font-medium text-xs">
                          {item.title}
                        </span>
                        {item.timeAgo && (
                          <span className="text-[10px] text-slate-400">
                            {item.timeAgo}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Three Dots Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : item.id || null);
                      }}
                      className={`absolute right-1.5 top-2 p-1 rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-all cursor-pointer ${
                        isMenuOpen ? "opacity-100 bg-slate-200/80 text-slate-700" : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 text-xs font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onAddToCollection && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onAddToCollection(item);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                          >
                            <FolderInput className="w-3 h-3 text-slate-400" />
                            <span>Add to Collection</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartRenameRecent(item)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteConfirmId(item.id || null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-100 flex flex-col gap-1 bg-white relative">
        <button
          onClick={() => onSelectItem?.("Settings")}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-md text-xs transition-all cursor-pointer font-medium ${
            activeItem === "Settings"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Settings</span>
        </button>

        {/* User Profile Bar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-800 font-medium hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="truncate font-semibold text-slate-900 leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Online
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Profile / Logout Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-12 left-0 w-full bg-white border border-slate-200 rounded-md shadow-lg p-1 text-xs z-30">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-left transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
