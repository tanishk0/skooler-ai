import { GoogleGenAI } from "@google/genai";
import { ITopic } from "@/lib/db/models";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface ExtractionResult {
  title: string;
  subject: string;
  summary: string;
  topics: ITopic[];
}

export async function extractTopicsAndMetadata(
  text: string,
  fileName: string
): Promise<ExtractionResult> {
  const truncatedText = text.slice(0, 8000); // Analyze up to first 8000 characters

  const prompt = `Analyze the following study material text extracted from file "${fileName}".
Provide a structured JSON output with the following exact keys:
- "title": A concise, clear title for this study material (max 6 words).
- "subject": The primary academic subject/field (e.g., Computer Science, Organic Chemistry, Physics, World History, Microeconomics, Medical Biology).
- "summary": A 2-3 sentence high-level overview of the material.
- "topics": An array of 4 to 6 key study topics identified in the material. Each topic object must have:
  - "name": Concise topic name (e.g. "Newton's Laws of Motion")
  - "description": 1-line description of what this topic covers

Return ONLY valid JSON without markdown wrapping.

Text content:
${truncatedText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawJson = response.text || "";
    rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawJson);

    const topics: ITopic[] = (parsed.topics || []).map((t: any, idx: number) => ({
      id: `topic-${Date.now()}-${idx}`,
      name: t.name || `Topic ${idx + 1}`,
      description: t.description || "Core study concept",
      order: idx + 1,
    }));

    return {
      title: parsed.title || fileName.replace(/\.[^/.]+$/, ""),
      subject: parsed.subject || "General Science & Humanities",
      summary: parsed.summary || "Extracted study material knowledge base.",
      topics: topics.length > 0 ? topics : [
        { id: `topic-${Date.now()}-1`, name: "Core Concepts", description: "Main foundational principles", order: 1 },
        { id: `topic-${Date.now()}-2`, name: "Key Definitions", description: "Essential terminology", order: 2 },
      ],
    };
  } catch (err) {
    console.error("Topic extraction error:", err);
    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      subject: "General Study Material",
      summary: "Uploaded study material ready for interactive learning.",
      topics: [
        { id: `topic-${Date.now()}-1`, name: "Overview & Definitions", description: "General summary and terms", order: 1 },
        { id: `topic-${Date.now()}-2`, name: "Main Principles", description: "Core concepts and applications", order: 2 },
      ],
    };
  }
}
