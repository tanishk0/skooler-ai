"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import {
  Home,
  Folder,
  Plus,
  ChevronRight,
  Settings,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  LogOut,
  User,
  Loader2,
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

export const Sidebar: React.FC<SidebarProps> = ({
  userName = "User",
  activeItem = "Home",
  recents = [],
  collections = [],
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
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
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
      }
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isHomeActive =
    activeItem === "Home" ||
    activeItem === "Dashboard" ||
    activeItem === "" ||
    !activeItem;

  return (
    <aside
      ref={containerRef}
      className={`w-64 h-full min-h-screen bg-[#FDF8F3] border-r border-[#4E342E]/10 flex flex-col justify-between select-none shrink-0 font-sans ${className}`}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-6">
        {/* Brand Logo Header */}
        <div className="px-2 pb-6 flex items-center">
          <Link
            href="/"
            onClick={() => onSelectItem?.("Home")}
            className="flex items-center gap-2 group transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Image
              src="/assets/logo.png"
              alt="Skooler"
              width={145}
              height={46}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Main Navigation Item: Home */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => onSelectItem?.("Home")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left ${
              isHomeActive
                ? "bg-[#4E342E] text-white shadow-sm"
                : "text-[#4E342E] hover:bg-[#4E342E]/5"
            }`}
          >
            <Home
              className={`w-5 h-5 shrink-0 stroke-[2] ${
                isHomeActive ? "text-white" : "text-[#4E342E]"
              }`}
            />
            <span
              className={`text-[15px] ${
                isHomeActive ? "font-semibold text-white" : "font-medium text-[#4E342E]"
              }`}
            >
              Home
            </span>
          </button>
        </div>

        {/* Collections Section */}
        <div className="flex flex-col mt-4">
          {/* Header with Title and Add Button */}
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="font-semibold text-[15px] text-[#4E342E]">
              Collections
            </span>
            {onNewCollection && (
              <button
                type="button"
                onClick={onNewCollection}
                title="New Collection"
                className="text-[#4E342E] hover:text-[#8D6E63] p-1 rounded-lg hover:bg-[#4E342E]/5 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Collections List */}
          <div className="flex flex-col gap-1 mt-1">
            {normalizedCollections.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-[#8D6E63] italic">
                No collections yet
              </p>
            )}

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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4E342E]/5 border border-[#4E342E]/20 rounded-xl"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-0.5 text-xs bg-white border border-[#8D6E63]/30 rounded-lg text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#4E342E]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-[#6B8F71] hover:bg-[#6B8F71]/10 rounded-md transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-[#8D6E63] hover:bg-[#4E342E]/10 rounded-md transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </form>
                );
              }

              if (isDeleting) {
                return (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between px-2.5 py-2 bg-[#E57373]/10 border border-[#E57373]/30 rounded-xl text-xs"
                  >
                    <span className="text-[#E57373] font-medium text-xs truncate">
                      Delete?
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleConfirmDeleteCollection(collection)}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-[#E57373] text-white rounded-md hover:bg-[#E57373]/90 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 text-[11px] font-medium bg-[#8D6E63]/20 text-[#4E342E] rounded-md hover:bg-[#8D6E63]/30 transition-colors cursor-pointer"
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
                    type="button"
                    onClick={() => onSelectItem?.(collection)}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4E342E]/10 font-semibold"
                        : "hover:bg-[#4E342E]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <Folder className="w-5 h-5 text-[#4E342E] shrink-0 stroke-[1.8]" />
                      <span className="text-[14px] font-medium text-[#4E342E] truncate">
                        {collection.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#4E342E] shrink-0 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Options Dots button (revealed on group hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : collection.id || null);
                    }}
                    className={`absolute right-6 p-1 rounded-md text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 transition-all cursor-pointer ${
                      isMenuOpen ? "opacity-100 bg-[#4E342E]/10" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Collection Options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu for Rename/Delete */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-2 top-9 w-32 bg-[#FDF8F3] border border-[#4E342E]/15 rounded-xl shadow-lg z-30 py-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleStartRenameCollection(collection)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[#4E342E] hover:bg-[#4E342E]/10 text-left transition-colors cursor-pointer font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#8D6E63]" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          setDeleteConfirmId(collection.id || null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[#E57373] hover:bg-[#E57373]/10 text-left transition-colors cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#E57373]" />
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

      {/* Footer Section: User Profile & Dedicated Logout */}
      <div className="p-3 border-t border-[#4E342E]/10 flex flex-col gap-2 shrink-0 bg-[#FDF8F3]">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#4E342E]/5 border border-[#4E342E]/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#4E342E] text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#4E342E] truncate">
                {userName || "User"}
              </span>
              <span className="text-[10px] text-[#6B8F71] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B8F71]" />
                Active
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#C62828] hover:bg-[#E57373]/10 border border-[#E57373]/25 bg-white/50 hover:border-[#E57373]/40 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5 text-[#E57373]" />
              <span>Log out</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
