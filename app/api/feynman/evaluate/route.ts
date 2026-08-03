import { dbStore } from "@/lib/db/store";
import { evaluateFeynmanExplanation } from "@/lib/ai/feynman";
import { IStudySession } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { materialId, topic, promptQuestion, studentExplanation } = await req.json();

    if (!materialId || !topic || !promptQuestion || !studentExplanation) {
      return NextResponse.json(
        { error: "materialId, topic, promptQuestion, and studentExplanation are required" },
        { status: 400 }
      );
    }

    const evalResult = await evaluateFeynmanExplanation(
      topic,
      promptQuestion,
      studentExplanation,
      materialId
    );

    // Save study session metrics
    const sessionObj: IStudySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materialId,
      type: "feynman",
      topic,
      score: evalResult.overallScore,
      strongTopics: evalResult.whatYouNailed.length > 0 ? [topic] : [],
      weakTopics: evalResult.missingConcepts.length > 0 ? [topic] : [],
      missedConcepts: evalResult.missingConcepts,
      details: evalResult,
      createdAt: new Date().toISOString(),
    };

    await dbStore.saveStudySession(sessionObj);

    return NextResponse.json({ success: true, evaluation: evalResult });
  } catch (error: any) {
    console.error("Feynman evaluation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate explanation" },
      { status: 500 }
    );
  }
}
