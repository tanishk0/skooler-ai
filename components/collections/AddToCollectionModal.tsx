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
        className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] bg-[#FDF8F3] rounded-2xl shadow-2xl border border-[#4E342E]/15 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#4E342E]/10 flex items-center justify-between bg-[#FDF8F3]">
          <div>
            <h2 className="font-semibold text-[#4E342E] text-sm">
              Add to Collection
            </h2>
            <p className="text-xs text-[#8D6E63] truncate max-w-[240px]">
              {sessionTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          {error && (
            <div className="p-2.5 text-xs bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] rounded-xl font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#8D6E63]">
              <Loader2 className="w-5 h-5 animate-spin text-[#4E342E]" />
              <span className="text-xs">Loading collections...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
              {/* Option: None (Remove from Collection) */}
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  selectedId === null
                    ? "bg-[#4E342E]/10 border border-[#4E342E]/20 text-[#4E342E] font-medium"
                    : "hover:bg-[#4E342E]/5 text-[#4E342E]"
                }`}
              >
                <span>None (No Collection)</span>
                {selectedId === null && (
                  <Check className="w-4 h-4 text-[#6B8F71] stroke-[2.5] shrink-0" />
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#4E342E]/10 border border-[#4E342E]/20 text-[#4E342E] font-medium"
                        : "hover:bg-[#4E342E]/5 text-[#4E342E]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <Folder className="w-4 h-4 text-[#4E342E] shrink-0 stroke-[1.8]" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#6B8F71] stroke-[2.5] shrink-0" />
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#4E342E]/25 text-xs font-semibold text-[#4E342E] hover:bg-[#4E342E]/5 hover:border-[#4E342E]/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Create New Collection</span>
            </button>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#4E342E]/10 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#4E342E] hover:bg-[#3D2924] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99]"
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
