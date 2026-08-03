import { GoogleGenAI } from "@google/genai";
import { embedText } from "@/lib/embedding";
import { searchChunks } from "@/lib/pinecone";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface QuizEvaluationResult {
  score: number; // 0-100
  totalQuestions: number;
  correctAnswers: number;
  strongTopics: string[];
  weakTopics: string[];
  missedConcepts: string[];
  questionResults: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    topic: string;
  }>;
}

export async function generateQuizQuestions(
  materialId: string,
  topic: string,
  rawText?: string
): Promise<QuizQuestion[]> {
  let contextText = "";
  try {
    const queryEmbedding = await embedText(topic);
    const searchResults = await searchChunks(queryEmbedding, 6);
    const matches = searchResults.filter((r) => r.materialId === materialId || !r.materialId);
    if (matches.length > 0) {
      contextText = matches.map((m) => m.text).join("\n\n");
    }
  } catch (err) {
    console.warn("Quiz RAG error, fallback:", err);
  }

  if (!contextText && rawText) {
    contextText = rawText.slice(0, 6000);
  }

  const prompt = `You are an expert exam creator. Generate 5 multiple-choice active recall quiz questions for the topic "${topic}" based on the study text.

Return a JSON array of 5 objects, where each object has:
- "question": Clear, direct active recall question.
- "options": Array of 4 plausible answer choices.
- "correctIndex": Integer (0, 1, 2, or 3) indicating the correct answer option index.
- "explanation": Concise 1-line explanation of why this answer is correct.
- "topic": Topic name tag (e.g. "${topic}").

Return ONLY valid JSON without markdown formatting.

Study Text Context:
${contextText || "General topic study text."}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let rawJson = response.text || "";
  rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

  const parsed = JSON.parse(rawJson);

  return (parsed || []).map((q: any, idx: number) => ({
    id: `q-${Date.now()}-${idx}`,
    question: q.question || `Question ${idx + 1}`,
    options: q.options || ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
    explanation: q.explanation || "Correct based on study notes.",
    topic: q.topic || topic,
  }));
}

export function evaluateQuizSubmission(
  questions: QuizQuestion[],
  userAnswers: Record<string, number>
): QuizEvaluationResult {
  let correctCount = 0;
  const strongTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();
  const missedConceptsSet = new Set<string>();

  const questionResults = questions.map((q) => {
    const userChoiceIndex = userAnswers[q.id];
    const isCorrect = userChoiceIndex === q.correctIndex;

    if (isCorrect) {
      correctCount++;
      strongTopicsSet.add(q.topic);
    } else {
      weakTopicsSet.add(q.topic);
      missedConceptsSet.add(q.question.replace(/^What is /i, "").replace(/\?$/, ""));
    }

    return {
      questionId: q.id,
      question: q.question,
      userAnswer: q.options[userChoiceIndex] ?? "Not answered",
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
    };
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    score,
    totalQuestions: total,
    correctAnswers: correctCount,
    strongTopics: Array.from(strongTopicsSet),
    weakTopics: Array.from(weakTopicsSet),
    missedConcepts: Array.from(missedConceptsSet),
    questionResults,
  };
}
