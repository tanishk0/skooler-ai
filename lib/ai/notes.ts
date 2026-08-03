import { GoogleGenAI } from "@google/genai";
import { embedText } from "@/lib/embedding";
import { searchChunks } from "@/lib/pinecone";
import { IShortNote } from "@/lib/db/models";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateShortNotes(
  materialId: string,
  topic: string,
  rawMaterialText?: string
): Promise<IShortNote> {
  // 1. Retrieve RAG chunks for topic
  let contextText = "";
  try {
    const queryEmbedding = await embedText(topic);
    const searchResults = await searchChunks(queryEmbedding, 6);
    const matchingChunks = searchResults.filter((r) => r.materialId === materialId || !r.materialId);
    
    if (matchingChunks.length > 0) {
      contextText = matchingChunks.map((c) => c.text).join("\n\n");
    }
  } catch (err) {
    console.warn("RAG retrieval for notes fallback to raw text:", err);
  }

  if (!contextText && rawMaterialText) {
    contextText = rawMaterialText.slice(0, 6000);
  }

  const prompt = `You are a world-class academic tutor. Create high-yield, structured Short Notes for the topic "${topic}" based on the study material context below.

Return a JSON object with EXACTLY these keys:
- "bulletPoints": Array of 4 to 6 concise, bullet-point key takeaways.
- "definitions": Array of objects: [{"term": "Term Name", "definition": "Clear 1-line definition"}] (3 to 5 key terms).
- "keyFormulas": Array of strings representing important equations, rules, or core laws (1 to 4 items). If no mathematical equations exist, include core laws/rules.
- "examples": Array of 2 to 3 practical real-world examples or applications.
- "summary": A 2-sentence executive overview of this topic.

Return ONLY valid JSON without markdown wrapping.

Context:
${contextText || "General topic study material."}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let rawJson = response.text || "";
  rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

  const parsed = JSON.parse(rawJson);

  return {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    materialId,
    topic,
    bulletPoints: parsed.bulletPoints || [],
    definitions: parsed.definitions || [],
    keyFormulas: parsed.keyFormulas || [],
    examples: parsed.examples || [],
    summary: parsed.summary || "",
    createdAt: new Date().toISOString(),
  };
}
