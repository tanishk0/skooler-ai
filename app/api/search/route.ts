import { embedText } from "@/lib/embedding";
import { searchChunks } from "@/lib/pinecone";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, topK = 5, generateAnswer = true } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // 1. Generate embedding for query
    const queryEmbedding = await embedText(query.trim());

    // 2. Query Pinecone vector database
    const results = await searchChunks(queryEmbedding, Math.min(Math.max(Number(topK) || 5, 1), 20));

    let aiAnswer: string | null = null;

    // 3. If requested and we have results, generate RAG synthesis answer using Gemini
    if (generateAnswer && results.length > 0) {
      try {
        const contextText = results
          .map(
            (r, i) =>
              `[Source ${i + 1}: ${r.fileName} (Relevance: ${(r.score * 100).toFixed(1)}%)]\n${r.text}`
          )
          .join("\n\n---\n\n");

        const prompt = `You are Skooler AI, an expert educational and document assistant.
Answer the user's question using ONLY the retrieved context passages below.
If the context does not contain enough information to answer fully, explain what is available and state any missing details accurately.
Be direct, structured, clear, and cite source numbers like [Source 1] where relevant.

User Question: "${query.trim()}"

Retrieved Document Context:
${contextText}

Provide a helpful, precise answer:`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        aiAnswer = response.text || null;
      } catch (err: any) {
        console.error("AI Generation error:", err);
        // Fallback gracefully without breaking vector results
        aiAnswer = "Could not generate AI synthesis, but matched document passages are shown below.";
      }
    }

    return NextResponse.json({
      success: true,
      query: query.trim(),
      results,
      answer: aiAnswer,
      totalCount: results.length,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: error?.message || "Search operation failed" },
      { status: 500 }
    );
  }
}
