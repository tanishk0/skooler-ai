import { dbStore } from "@/lib/db/store";
import { evaluateQuizSubmission, QuizQuestion } from "@/lib/ai/quiz";
import { IStudySession } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { materialId, topic, questions, userAnswers } = await req.json();

    if (!materialId || !topic || !questions || !userAnswers) {
      return NextResponse.json(
        { error: "materialId, topic, questions, and userAnswers are required" },
        { status: 400 }
      );
    }

    const evalResult = evaluateQuizSubmission(questions as QuizQuestion[], userAnswers);

    // Save study session
    const sessionObj: IStudySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materialId,
      type: "quiz",
      topic,
      score: evalResult.score,
      totalQuestions: evalResult.totalQuestions,
      correctAnswers: evalResult.correctAnswers,
      strongTopics: evalResult.strongTopics,
      weakTopics: evalResult.weakTopics,
      missedConcepts: evalResult.missedConcepts,
      details: evalResult.questionResults,
      createdAt: new Date().toISOString(),
    };

    await dbStore.saveStudySession(sessionObj);

    return NextResponse.json({ success: true, evaluation: evalResult });
  } catch (error: any) {
    console.error("Quiz evaluation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate quiz" },
      { status: 500 }
    );
  }
}
