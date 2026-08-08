"use client";

import React, { useState, useEffect } from "react";
import { Folder, Plus, X, Check, Loader2 } from "lucide-react";

interface CollectionSummary {
  id: string;
  name: string;
  topicCount?: number;
}

interface AddToCollectionModalProps {
  isOpen: boolean;
  sessionId: string;
  sessionTopic: string;
  currentCollectionId?: string | null;
  onClose: () => void;
  onSuccess: (updatedCollectionId: string | null) => void;
  onOpenCreateCollection?: () => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  sessionId,
  sessionTopic,
  currentCollectionId = null,
  onClose,
  onSuccess,
  onOpenCreateCollection,
}) => {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    currentCollectionId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentCollectionId);
      fetchCollections();
    }
  }, [isOpen, currentCollectionId]);

  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/collections");
      const json = await res.json();
      if (res.ok && json.collections) {
        setCollections(json.collections);
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/learning/sessions/${sessionId}/collection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: selectedId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update session collection");
      }

      onSuccess(selectedId);
      onClose();
    } catch (err) {
      console.error("Error updating session collection:", err);
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div
        className="w-full max-w-sm bg-white rounded-md shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="font-semibold text-zinc-900 text-sm">
              Add to Collection
            </h2>
            <p className="text-xs text-zinc-500 truncate max-w-[240px]">
              {sessionTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          {error && (
            <div className="p-2.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">Loading collections...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
              {/* Option: None (Remove from Collection) */}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                  selectedId === null
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium"
                    : "hover:bg-zinc-50 text-zinc-600"
                }`}
              >
                <span>None (No Collection)</span>
                {selectedId === null && (
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
              </button>

              {/* List of Collections */}
              {collections.map((col) => {
                const isSelected = selectedId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedId(col.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium"
                        : "hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Folder className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action: Create New Collection trigger */}
          {onOpenCreateCollection && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateCollection();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-zinc-300 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Collection</span>
            </button>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
