import { IStudySession, ITopic } from "@/lib/db/models";

export interface StudyInsightsResult {
  masteryScore: number; // 0-100
  totalSessions: number;
  strongTopics: string[];
  weakTopics: string[];
  frequentlyMissedConcepts: string[];
  recommendedTopic: string;
  progressOverTime: Array<{ date: string; score: number }>;
}

export function computeStudyInsights(
  sessions: IStudySession[],
  topics: ITopic[]
): StudyInsightsResult {
  if (sessions.length === 0) {
    const defaultTopic = topics[0]?.name || "Core Concepts";
    return {
      masteryScore: 0,
      totalSessions: 0,
      strongTopics: [],
      weakTopics: topics.map((t) => t.name),
      frequentlyMissedConcepts: [],
      recommendedTopic: defaultTopic,
      progressOverTime: [],
    };
  }

  // Calculate average score
  const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
  const masteryScore = Math.round(totalScore / sessions.length);

  // Strong & weak topic counts
  const strongMap = new Map<string, number>();
  const weakMap = new Map<string, number>();
  const missedMap = new Map<string, number>();

  sessions.forEach((s) => {
    (s.strongTopics || []).forEach((t) => {
      strongMap.set(t, (strongMap.get(t) || 0) + 1);
    });
    (s.weakTopics || []).forEach((t) => {
      weakMap.set(t, (weakMap.get(t) || 0) + 1);
    });
    (s.missedConcepts || []).forEach((c) => {
      missedMap.set(c, (missedMap.get(c) || 0) + 1);
    });
  });

  const sortedStrong = Array.from(strongMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  const sortedWeak = Array.from(weakMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  const sortedMissed = Array.from(missedMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0])
    .slice(0, 5);

  // Recommended next topic (pick highest priority weak topic or unstudied topic)
  let recommendedTopic = sortedWeak[0];
  if (!recommendedTopic) {
    const unstudied = topics.find((t) => !strongMap.has(t.name));
    recommendedTopic = unstudied ? unstudied.name : topics[0]?.name || "Review Notes";
  }

  // Progress over time
  const progressOverTime = sessions
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: s.score,
    }));

  return {
    masteryScore,
    totalSessions: sessions.length,
    strongTopics: sortedStrong,
    weakTopics: sortedWeak.length > 0 ? sortedWeak : topics.slice(1).map((t) => t.name),
    frequentlyMissedConcepts: sortedMissed,
    recommendedTopic,
    progressOverTime,
  };
}
