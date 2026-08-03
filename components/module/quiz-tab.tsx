"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { IStudyMaterial } from "@/lib/db/models";
import { QuizQuestion, QuizEvaluationResult } from "@/lib/ai/quiz";

interface QuizTabProps {
  material: IStudyMaterial;
}

export function QuizTab({ material }: QuizTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(
    material.topics?.[0]?.name || "Core Concepts"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<QuizEvaluationResult | null>(null);

  const handleStartQuiz = async (topicName?: string) => {
    const topic = topicName || selectedTopic;
    setIsGenerating(true);
    setQuestions([]);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowAnswerFeedback(false);
    setEvaluation(null);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id, topic }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz questions");
      }

      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (showAnswerFeedback) return;
    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
    setShowAnswerFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowAnswerFeedback(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material.id,
          topic: selectedTopic,
          questions,
          userAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate quiz");

      setEvaluation(data.evaluation);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Evaluation error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-8 font-sans">
      {/* Topic selector */}
      {!questions.length && !isGenerating && !evaluation && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Recall Quiz Me</h2>
            <p className="text-xs text-zinc-400">Test your retention with instant feedback and topic mastery scoring.</p>
          </div>

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
            onClick={() => handleStartQuiz()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Active Recall Quiz</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {(isGenerating || isEvaluating) && (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-indigo-400 animate-spin" />
          <h3 className="text-base font-bold text-white">
            {isGenerating ? "Generating Flashcard Quiz..." : "Calculating Mastery Score..."}
          </h3>
          <p className="text-xs text-zinc-500">Formulating active recall questions from your notes</p>
        </div>
      )}

      {/* Active Quiz Flashcard Card */}
      {!isGenerating && questions.length > 0 && !evaluation && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                {currentQ.topic}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-32 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const selectedIdx = userAnswers[currentQ.id];
              const isSelected = selectedIdx === idx;
              const isCorrect = currentQ.correctIndex === idx;

              let optionStyle = "bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700";

              if (showAnswerFeedback) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold";
                } else if (isSelected) {
                  optionStyle = "bg-red-500/10 border-red-500/40 text-red-300 font-semibold";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={showAnswerFeedback}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-[10px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {showAnswerFeedback && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {showAnswerFeedback && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation Box */}
          {showAnswerFeedback && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-xs font-bold">
                {userAnswers[currentQ.id] === currentQ.correctIndex ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct Answer!</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{currentQ.explanation}</p>

              <button
                onClick={handleNextQuestion}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
              >
                <span>{currentIndex + 1 < questions.length ? "Next Question" : "View Final Report"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final Evaluation Report */}
      {evaluation && (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Quiz Performance Report</h3>
                <p className="text-xs text-zinc-400">Saved to your Study History</p>
              </div>
            </div>

            <button
              onClick={() => handleStartQuiz()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Mastery Score</span>
              <div className="text-3xl font-extrabold text-indigo-400">{evaluation.score}%</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Correct Answers</span>
              <div className="text-3xl font-extrabold text-emerald-400">
                {evaluation.correctAnswers} / {evaluation.totalQuestions}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-500">Topic Area</span>
              <div className="text-sm font-bold text-white truncate pt-2">{selectedTopic}</div>
            </div>
          </div>

          {/* Strong vs Weak Topics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <Target className="w-4 h-4" />
                <span>Strong Topics</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {evaluation.strongTopics.map((st, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Weak Topics / Needs Review</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {evaluation.weakTopics.length > 0 ? (
                  evaluation.weakTopics.map((wt, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {wt}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">None! Perfect score.</span>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown per question */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Question Explanations</h4>
            <div className="space-y-2">
              {evaluation.questionResults.map((qr, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">Q{i + 1}: {qr.question}</span>
                    {qr.isCorrect ? (
                      <span className="text-emerald-400 font-bold text-[11px]">Correct</span>
                    ) : (
                      <span className="text-red-400 font-bold text-[11px]">Missed</span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-[11px]">{qr.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
