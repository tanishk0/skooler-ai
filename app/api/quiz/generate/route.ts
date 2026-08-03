import { dbStore } from "@/lib/db/store";
import { generateQuizQuestions } from "@/lib/ai/quiz";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { materialId, topic } = await req.json();

    if (!materialId || !topic) {
      return NextResponse.json(
        { error: "materialId and topic are required" },
        { status: 400 }
      );
    }

    const material = await dbStore.getMaterialById(materialId);
    const questions = await generateQuizQuestions(
      materialId,
      topic,
      material?.rawText
    );

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}
