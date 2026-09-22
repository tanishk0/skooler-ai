"use client";

import React, { useState, useRef, useEffect } from "react";
import LearningRoadmap from "./LearningRoadmap";
import LearningTimeline from "./LearningTimeline";
import ModuleBuildingProgress from "./ModuleBuildingProgress";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import DrawerOverlay from "@/components/layout/DrawerOverlay";
import { Concept, LearningEvent, InteractionResponse, LearningState } from "@/lib/ai/types";
import { Loader2, AlertCircle, FileText, X, BookOpen, Menu, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

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
      {/* Mobile Top Header */}
      <MobileHeader
        title={session.topic}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMobileRoadmapOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4E342E]/5 hover:bg-[#4E342E]/10 border border-[#4E342E]/10 text-[#4E342E] text-xs font-semibold transition-colors cursor-pointer"
              title="Open Syllabus Roadmap"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8D6E63]" />
              <span>Syllabus</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-1.5 rounded-xl border border-[#4E342E]/15 bg-white hover:bg-[#4E342E]/5 text-[#4E342E] transition-colors cursor-pointer"
              title="Session Log"
            >
              <FileText className="w-4 h-4 text-[#8D6E63]" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-xl border border-[#E57373]/20 bg-white hover:bg-[#E57373]/10 text-[#C62828] transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4 text-[#E57373]" />
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0]/60 min-w-0">
        {/* Desktop Top Navigation Bar */}
        <header className="hidden lg:flex w-full px-8 py-3.5 border-b border-[#4E342E]/10 bg-[#FDF8F3] items-center justify-between shadow-2xs shrink-0 font-sans min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-xs min-w-0 flex-1 pr-4">
            <h2 className="font-bold tracking-wider text-[#4E342E] uppercase text-xs truncate max-w-[200px]">
              {session.topic}
            </h2>
            {currentModule && (
              <>
                <span className="text-[#8D6E63]/40">•</span>
                <span className="font-semibold text-[#4E342E] bg-[#4E342E]/5 px-2.5 py-0.5 rounded-lg border border-[#4E342E]/10 truncate max-w-[200px]">
                  {currentModule.name} ({currentModuleIdx + 1}/{modules?.length || 1})
                </span>
              </>
            )}
            {currentConcept && (
              <>
                <span className="text-[#8D6E63]/40">•</span>
                <span className="font-medium text-[#8D6E63] truncate max-w-[220px]">
                  {currentConcept.name} ({currentIdx + 1}/{concepts.length})
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-[#4E342E] border border-[#4E342E]/15 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? "bg-[#6B8F71]" : "bg-[#4E342E]"}`} />
              {isComplete ? "Completed" : "Active Session"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#4E342E]/15 bg-white hover:bg-[#4E342E]/5 text-[#4E342E] text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#8D6E63]" />
              <span>Session Log</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E57373]/25 bg-white hover:bg-[#E57373]/10 text-[#C62828] text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-[#E57373]" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {/* Learning Content Stream */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col items-center min-w-0 max-w-full"
        >
          <div className="w-full max-w-3xl flex flex-col gap-6 py-2 sm:py-4 min-w-0">
            {errorMessage && (
              <div className="w-full p-4 rounded-xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E57373]" />
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

            {/* Proper Progress Bar & Engine Status when processing */}
            {isSubmitting && (
              <ModuleBuildingProgress
                isOpen={isSubmitting}
                topic={currentModule?.name || currentConcept?.name || session.topic}
                mode="inline"
                type="session_step"
              />
            )}
          </div>
        </main>

        {/* Session Log Drawer / Modal Overlay */}
        {showTranscript && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-[#FDF8F3] h-full shadow-2xl flex flex-col border-l border-[#4E342E]/15 font-sans">
              <div className="px-5 py-4 border-b border-[#4E342E]/10 flex items-center justify-between bg-[#FDF8F3]">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#4E342E]" />
                  <h3 className="font-bold text-[#4E342E] text-sm">
                    Session Log & Transcript
                  </h3>
                </div>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="p-1 rounded-lg text-[#8D6E63] hover:text-[#4E342E] hover:bg-[#4E342E]/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {events.map((evt, idx) => (
                  <div
                    key={evt._id || idx}
                    className={`p-4 rounded-xl text-xs border ${
                      evt.role === "user"
                        ? "bg-white border-[#4E342E]/10 text-[#4E342E]"
                        : "bg-[#4E342E]/5 border-[#4E342E]/15 text-[#4E342E]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#8D6E63] font-bold uppercase tracking-wider mb-1.5">
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
