import { GoogleGenAI } from "@google/genai";
import { embedText } from "@/lib/embedding";
import { searchChunks } from "@/lib/pinecone";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface FeynmanEvaluationResult {
  overallScore: number; // 0-100
  correctnessScore: number; // 0-100
  completenessScore: number; // 0-100
  clarityScore: number; // 0-100
  feedback: string;
  whatYouNailed: string[];
  missingConcepts: string[];
  suggestions: string[];
}

export async function generateFeynmanPrompt(
  materialId: string,
  topic: string
): Promise<string> {
  const prompts = [
    `Explain "${topic}" in your own words as if you were teaching it to a 12-year-old.`,
    `Break down the core concept of "${topic}" step-by-step. What makes it work and why does it matter?`,
    `Imagine you are giving a 2-minute lecture on "${topic}". What are the essential ideas every student must grasp?`,
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

export async function evaluateFeynmanExplanation(
  topic: string,
  promptQuestion: string,
  studentExplanation: string,
  materialId: string
): Promise<FeynmanEvaluationResult> {
  let contextText = "";
  try {
    const queryEmbedding = await embedText(topic);
    const searchResults = await searchChunks(queryEmbedding, 6);
    const matches = searchResults.filter((m) => m.materialId === materialId || !m.materialId);
    if (matches.length > 0) {
      contextText = matches.map((m) => m.text).join("\n\n");
    }
  } catch (err) {
    console.warn("Feynman RAG retrieval error:", err);
  }

  const evalPrompt = `You are Richard Feynman, the master physics teacher and clear thinker.
Evaluate the student's explanation for the topic "${topic}" based on the reference study material context below.

Question Prompt: "${promptQuestion}"
Student's Explanation: "${studentExplanation}"

Reference Material:
${contextText || "General topic reference text."}

Evaluate the response objectively and return a JSON object with EXACTLY these keys:
- "overallScore": Integer score (0 to 100).
- "correctnessScore": Integer score (0 to 100).
- "completenessScore": Integer score (0 to 100).
- "clarityScore": Integer score (0 to 100).
- "feedback": 2-sentence encouraging, constructive summary feedback in Richard Feynman's voice.
- "whatYouNailed": Array of 2-3 specific points the student explained correctly.
- "missingConcepts": Array of 2-3 key nuances or terms the student missed or overlooked.
- "suggestions": Array of 2-3 actionable tips to make the explanation even clearer.

Return ONLY valid JSON without markdown wrapping.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: evalPrompt,
  });

  let rawJson = response.text || "";
  rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

  const parsed = JSON.parse(rawJson);

  return {
    overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 80,
    correctnessScore: typeof parsed.correctnessScore === "number" ? parsed.correctnessScore : 85,
    completenessScore: typeof parsed.completenessScore === "number" ? parsed.completenessScore : 75,
    clarityScore: typeof parsed.clarityScore === "number" ? parsed.clarityScore : 80,
    feedback: parsed.feedback || "Good effort! Keep practicing simple explanations.",
    whatYouNailed: parsed.whatYouNailed || ["Understood the main idea"],
    missingConcepts: parsed.missingConcepts || [],
    suggestions: parsed.suggestions || ["Use simple analogies to ground your explanation"],
  };
}
