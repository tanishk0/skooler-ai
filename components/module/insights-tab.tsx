"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Target,
  AlertTriangle,
  Compass,
  Trophy,
  Loader2,
  TrendingUp,
  Brain,
  Zap,
} from "lucide-react";
import { IStudyMaterial } from "@/lib/db/models";
import { StudyInsightsResult } from "@/lib/ai/insights";

interface StudyInsightsTabProps {
  material: IStudyMaterial;
}

export function StudyInsightsTab({ material }: StudyInsightsTabProps) {
  const [insights, setInsights] = useState<StudyInsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/insights/${material.id}`);
        const data = await res.json();
        if (res.ok) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [material.id]);

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 mx-auto text-indigo-400 animate-spin" />
        <h3 className="text-base font-bold text-white">Aggregating Study Insights...</h3>
        <p className="text-xs text-zinc-500">Processing Quiz and Feynman learning sessions</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-3xl">
        Could not load study insights.
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>Study Analytics & Insights</span>
          <LineChart className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-xs text-zinc-400">
          Aggregated active recall and Feynman teaching metrics across all study sessions.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Overall Mastery</span>
            <Trophy className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-4xl font-extrabold text-white">{insights.masteryScore}%</div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${insights.masteryScore}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Total Study Sessions</span>
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-4xl font-extrabold text-white">{insights.totalSessions}</div>
          <p className="text-[11px] text-zinc-500">Quizzes & Feynman challenges completed</p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Recommended Focus</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-300 truncate pt-1">
            {insights.recommendedTopic}
          </div>
          <p className="text-[11px] text-zinc-500">Priority topic for your next session</p>
        </div>
      </div>

      {/* Strong vs Weak Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <Target className="w-4 h-4" />
            <span>Mastered / Strong Topics</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {insights.strongTopics.length > 0 ? (
              insights.strongTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  ✓ {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">Complete more sessions to establish strong topics.</span>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Needs Review / Weak Topics</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {insights.weakTopics.length > 0 ? (
              insights.weakTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  ! {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-500">No weak topics identified yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Missed Concepts */}
      {insights.frequentlyMissedConcepts.length > 0 && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-400">
            <Zap className="w-4 h-4" />
            <span>Frequently Missed Concepts</span>
          </div>

          <div className="space-y-2">
            {insights.frequentlyMissedConcepts.map((concept, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                ❌ {concept}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Over Time */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Session History & Score Progression</span>
        </div>

        {insights.progressOverTime.length > 0 ? (
          <div className="space-y-2">
            {insights.progressOverTime.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-400">Session #{i + 1} ({p.date})</span>
                <span className="font-bold text-indigo-400">{p.score}% Score</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No study sessions recorded yet. Try Quiz Me or Feynman Learning!</p>
        )}
      </div>
    </div>
  );
}
