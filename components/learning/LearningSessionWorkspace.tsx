"use client";

import React, { useState, useRef, useEffect } from "react";
import LearningRoadmap from "./LearningRoadmap";
import LearningTimeline from "./LearningTimeline";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import DrawerOverlay from "@/components/layout/DrawerOverlay";
import { Concept, LearningEvent, InteractionResponse, LearningState } from "@/lib/ai/types";
import { Loader2, AlertCircle, FileText, X, BookOpen, Menu } from "lucide-react";

export interface SerializedSession {
  id: string;
  topic: string;
  status: "in_progress" | "completed";
  mastery: number;
  learningState?: LearningState | null;
}

interface LearningSessionWorkspaceProps {
  userName: string;
  initialSession: SerializedSession;
  initialEvents: LearningEvent[];
  recentSessions: Array<{ id: string; topic: string }>;
}

export const LearningSessionWorkspace: React.FC<LearningSessionWorkspaceProps> = ({
  userName = "User",
  initialSession,
  initialEvents,
  recentSessions = [],
}) => {
  const [session, setSession] = useState<SerializedSession>(initialSession);
  const [events, setEvents] = useState<LearningEvent[]>(initialEvents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileRoadmapOpen, setIsMobileRoadmapOpen] = useState(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    mainScrollRef.current?.scrollTo({
      top: mainScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [events, isSubmitting]);

  // Extract concepts & modules list for sidebar roadmap
  const concepts: Concept[] = session.learningState?.concepts || [
    { id: "1", name: session.topic, description: "", status: "in_progress", attempts: 0 },
  ];
  const modules = session.learningState?.plan?.modules;
  const currentIdx = session.learningState?.currentConceptIndex || 0;
  const currentModuleIdx = session.learningState?.currentModuleIndex || 0;
  const isComplete = session.status === "completed";

  const currentConcept = concepts[currentIdx] || concepts[0];
  const currentModule = modules && modules.length > 0
    ? (modules[currentModuleIdx] || modules.find((m) => m.id === currentConcept?.moduleId))
    : null;

  const handleAnswerSubmit = async (
    responseValue: string,
    eventId?: string,
    interactionType: InteractionResponse["type"] = "feynman"
  ) => {
    if (!responseValue.trim() || isSubmitting || isComplete) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/learning/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
          eventId: eventId || null,
          response: {
            type: interactionType,
            value: responseValue.trim(),
          },
        }),
      });

      const json = (await res.json()) as {
        error?: string;
        newEvents?: LearningEvent[];
        session?: SerializedSession;
      };

      if (!res.ok) {
        throw new Error(json.error || "Failed to submit response");
      }

      const newEvents = json.newEvents;
      if (!newEvents || !Array.isArray(newEvents) || !json.session) {
        throw new Error("The server returned an incomplete learning update.");
      }
      setEvents((prev) => [...prev, ...newEvents]);
      setSession(json.session);
    } catch (err) {
      console.error("Error submitting answer:", err);
      setErrorMessage((err as Error).message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (isSubmitting || isComplete) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/learning/continue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      });

      const json = (await res.json()) as {
        error?: string;
        newEvents?: LearningEvent[];
        session?: SerializedSession;
      };

      if (!res.ok) {
        throw new Error(json.error || "Failed to continue learning session");
      }

      const newEvents = json.newEvents;
      if (!newEvents || !Array.isArray(newEvents) || !json.session) {
        throw new Error("The server returned an incomplete learning update.");
      }
      setEvents((prev) => [...prev, ...newEvents]);
      setSession(json.session);
    } catch (err) {
      console.error("Error continuing learning session:", err);
      setErrorMessage((err as Error).message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenameConcept = (concept: Concept, newName: string) => {
    setSession((prev) => {
      if (!prev.learningState) return prev;
      const updatedConcepts = prev.learningState.concepts.map((c) =>
        c.id === concept.id ? { ...c, name: newName } : c
      );
      return {
        ...prev,
        learningState: {
          ...prev.learningState,
          concepts: updatedConcepts,
        },
      };
    });
  };

  const handleDeleteConcept = (concept: Concept) => {
    setSession((prev) => {
      if (!prev.learningState) return prev;
      const updatedConcepts = prev.learningState.concepts.filter(
        (c) => c.id !== concept.id
      );
      return {
        ...prev,
        learningState: {
          ...prev.learningState,
          concepts: updatedConcepts,
        },
      };
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f9fafb] font-sans overflow-x-hidden">
      {/* Mobile Top Header */}
      <MobileHeader
        title={session.topic}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileRoadmapOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Open Syllabus Roadmap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Syllabus</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Session Log"
            >
              <FileText className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        }
      />

      {/* Mobile Sidebar Drawer Overlay */}
      <DrawerOverlay
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="Navigation"
      >
        <Sidebar
          userName={userName}
          recents={recentSessions.map((s) => ({
            id: s.id,
            title: s.topic,
            href: `/learn/${s.id}`,
          }))}
          activeItem={session.topic}
          onSelectItem={() => setIsMobileSidebarOpen(false)}
          className="w-full border-r-0 h-full"
        />
      </DrawerOverlay>

      {/* Mobile Syllabus Roadmap Drawer Overlay */}
      <DrawerOverlay
        isOpen={isMobileRoadmapOpen}
        onClose={() => setIsMobileRoadmapOpen(false)}
        position="right"
        title="Syllabus & Roadmap"
      >
        <LearningRoadmap
          topic={session.topic}
          concepts={concepts}
          modules={modules}
          currentConceptIndex={currentIdx}
          currentModuleIndex={currentModuleIdx}
          isComplete={isComplete}
          onRenameConcept={handleRenameConcept}
          onDeleteConcept={handleDeleteConcept}
          className="w-full border-r-0 h-full p-4"
        />
      </DrawerOverlay>

      {/* Desktop Left Sidebar: Syllabus & Roadmap */}
      <div className="hidden lg:block shrink-0 h-full">
        <LearningRoadmap
          topic={session.topic}
          concepts={concepts}
          modules={modules}
          currentConceptIndex={currentIdx}
          currentModuleIndex={currentModuleIdx}
          isComplete={isComplete}
          onRenameConcept={handleRenameConcept}
          onDeleteConcept={handleDeleteConcept}
        />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white min-w-0">
        {/* Desktop Top Navigation Bar */}
        <header className="hidden lg:flex w-full px-8 py-3.5 border-b border-slate-100/90 bg-white items-center justify-between shadow-2xs shrink-0 font-sans min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-xs min-w-0 flex-1 pr-4">
            <h2 className="font-bold tracking-wider text-slate-900 uppercase text-xs truncate max-w-[200px]">
              {session.topic}
            </h2>
            {currentModule && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80 truncate max-w-[200px]">
                  {currentModule.name} ({currentModuleIdx + 1}/{modules?.length || 1})
                </span>
              </>
            )}
            {currentConcept && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700 truncate max-w-[220px]">
                  {currentConcept.name} ({currentIdx + 1}/{concepts.length})
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? "bg-emerald-500" : "bg-indigo-600"}`} />
              {isComplete ? "Completed" : "Active Session"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Session Log</span>
          </button>
        </header>

        {/* Learning Content Stream */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col items-center min-w-0 max-w-full"
        >
          <div className="w-full max-w-3xl flex flex-col gap-6 py-2 sm:py-4 min-w-0">
            {errorMessage && (
              <div className="w-full p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Render Timeline Events */}
            <LearningTimeline
              events={events}
              sessionStatus={session.status}
              learningState={session.learningState}
              onSubmitAnswer={handleAnswerSubmit}
              onContinue={handleContinue}
              isSubmitting={isSubmitting}
            />

            {/* Spinner when processing */}
            {isSubmitting && (
              <div className="w-full max-w-3xl p-5 rounded-md bg-indigo-50/50 border border-indigo-100 flex items-center gap-3 text-indigo-900 text-sm font-medium animate-pulse shadow-2xs my-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
                <span>Skooler AI is analyzing your progress...</span>
              </div>
            )}
          </div>
        </main>

        {/* Session Log Drawer / Modal Overlay */}
        {showTranscript && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 font-sans">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Session Log & Transcript
                  </h3>
                </div>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {events.map((evt, idx) => (
                  <div
                    key={evt._id || idx}
                    className={`p-3.5 rounded-md text-xs border ${
                      evt.role === "user"
                        ? "bg-slate-50 border-slate-200/80 text-slate-800"
                        : "bg-indigo-50/40 border-indigo-100 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      <span>{evt.role === "user" ? "You" : "Skooler AI"}</span>
                      <span>{evt.type}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {evt.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningSessionWorkspace;
