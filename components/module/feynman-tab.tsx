"use client";

import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Loader2,
  Award,
} from "lucide-react";
import { IStudyMaterial } from "@/lib/db/models";
import { FeynmanEvaluationResult } from "@/lib/ai/feynman";

interface FeynmanTabProps {
  material: IStudyMaterial;
}

export function FeynmanTab({ material }: FeynmanTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    material.topics?.[0]?.name || "Core Concepts"
  );

  const [promptQuestion, setPromptQuestion] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const [studentExplanation, setStudentExplanation] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<FeynmanEvaluationResult | null>(null);

  const handleGeneratePrompt = async (topicName?: string) => {
    const topic = topicName || selectedTopic;
    setIsGeneratingPrompt(true);
    setPromptQuestion(null);
    setStudentExplanation("");
    setEvaluation(null);

    try {
      const res = await fetch("/api/feynman/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id, topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompt");

      setPromptQuestion(data.prompt);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start Feynman session");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSubmitExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentExplanation.trim() || !promptQuestion) return;

    setIsEvaluating(true);

    try {
      const res = await fetch("/api/feynman/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material.id,
          topic: selectedTopic,
          promptQuestion,
          studentExplanation: studentExplanation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate explanation");

      setEvaluation(data.evaluation);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>Feynman Learning Technique</span>
          <Brain className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-xs text-zinc-400">
          The best way to test if you truly master a concept is to teach it to someone else. Explain it simply to the AI.
        </p>
      </div>

      {/* Topic Cards */}
      {!promptQuestion && !isGeneratingPrompt && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {material.topics?.map((topic) => {
              const isSelected = selectedTopic === topic.name;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-950/50 border-indigo-500/50 text-white shadow-md"
                      : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-200 block truncate mb-1">{topic.name}</span>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">{topic.description}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleGeneratePrompt()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Teaching Prompt</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {(isGeneratingPrompt || isEvaluating) && (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-indigo-400 animate-spin" />
          <h3 className="text-base font-bold text-white">
            {isGeneratingPrompt ? "Generating Teaching Challenge..." : "Evaluating Explanation..."}
          </h3>
          <p className="text-xs text-zinc-500">Checking correctness, completeness, and clarity against your notes</p>
        </div>
      )}

      {/* Active Feynman Workspace */}
      {!isGeneratingPrompt && promptQuestion && !evaluation && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Prompt Question */}
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Teaching Challenge ({selectedTopic})
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
              &quot;{promptQuestion}&quot;
            </h3>
          </div>

          {/* Student Explanation Textarea */}
          <form onSubmit={handleSubmitExplanation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Your Explanation (Teach the AI in simple language):
              </label>
              <textarea
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Type your explanation here... Use simple terms, clear analogies, and step-by-step logic."
                rows={7}
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleGeneratePrompt()}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl cursor-pointer"
              >
                Change Challenge
              </button>

              <button
                type="submit"
                disabled={isEvaluating || !studentExplanation.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Evaluate Explanation</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feynman Evaluation Dashboard */}
      {evaluation && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Feynman Evaluation Breakdown</h3>
                <p className="text-xs text-zinc-400">{selectedTopic}</p>
              </div>
            </div>

            <button
              onClick={() => handleGeneratePrompt()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Next Challenge</span>
            </button>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Overall Score</span>
              <div className="text-3xl font-extrabold text-indigo-400">{evaluation.overallScore}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Correctness</span>
              <div className="text-2xl font-extrabold text-emerald-400">{evaluation.correctnessScore}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Completeness</span>
              <div className="text-2xl font-extrabold text-violet-400">{evaluation.completenessScore}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Clarity</span>
              <div className="text-2xl font-extrabold text-cyan-400">{evaluation.clarityScore}%</div>
            </div>
          </div>

          {/* AI Feedback Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed italic">
            &quot;{evaluation.feedback}&quot;
          </div>

          {/* What You Nailed vs Missing Concepts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You Nailed</span>
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {evaluation.whatYouNailed.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing / Overlooked Concepts</span>
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {evaluation.missingConcepts.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Suggestions */}
          {evaluation.suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Suggestions to Sharpen Explanation</span>
              </h4>
              <div className="space-y-2">
                {evaluation.suggestions.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
