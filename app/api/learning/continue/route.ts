import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AIClientError, continueLearning } from "@/lib/ai/client";
import { FastApiEvent, LearningEvent, LearningState } from "@/lib/ai/types";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningEventModel from "@/models/LearningEvent";
import LearningSession from "@/models/LearningSession";

const CONTINUE_STAGES: readonly LearningState["stage"][] = [
  "awaiting_continue_after_understood",
  "awaiting_continue_after_reteach",
  "awaiting_continue_after_evaluation",
  "awaiting_continue_after_concept_transition",
];

function serviceError(error: unknown) {
  const detail = error instanceof AIClientError ? error.data : undefined;
  const rawMessage = error instanceof AIClientError ? error.message : "Unable to continue the lesson.";
  const status = error instanceof AIClientError && error.status ? error.status : 503;
  let message = rawMessage;
  if (detail && typeof detail === "object" && "detail" in detail && typeof (detail as { detail: unknown }).detail === "string") {
    message = (detail as { detail: string }).detail;
  } else if (typeof detail === "string" && detail.trim()) {
    message = detail.trim();
  }
  return NextResponse.json({ error: message, detail }, { status });
}

function serializeEvent(event: InstanceType<typeof LearningEventModel>): LearningEvent {
  return {
    _id: event._id.toString(),
    sessionId: event.sessionId.toString(),
    parentEventId: event.parentEventId ? event.parentEventId.toString() : null,
    sequence: event.sequence,
    type: event.type as LearningEvent["type"],
    role: event.role as LearningEvent["role"],
    content: event.content,
    moduleId: event.moduleId || null,
    conceptId: event.conceptId || null,
    conceptName: event.conceptName || null,
    metadata: event.metadata as LearningEvent["metadata"],
    createdAt: event.createdAt.toISOString(),
  };
}

function eventDocument(event: FastApiEvent, sessionId: unknown, conceptName: string) {
  return {
    sessionId,
    parentEventId: null,
    type: event.type,
    role: event.type === "user_answer" ? "user" : "assistant",
    moduleId: event.moduleId ?? null,
    conceptId: event.conceptId ?? "",
    conceptName,
    content: event.content || event.question || "",
    metadata: { ...event.metadata, options: event.options },
  };
}

function serializeSession(session: InstanceType<typeof LearningSession>) {
  return { id: session._id.toString(), topic: session.topic, status: session.status, mastery: session.mastery, learningState: session.learningState as LearningState };
}

export async function POST(request: NextRequest) {
  const userSession = await auth.api.getSession({ headers: await headers() });
  if (!userSession?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { sessionId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  if (typeof body.sessionId !== "string") return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  try {
    await dbConnect();
    const learningSession = await LearningSession.findById(body.sessionId).exec();
    if (!learningSession) return NextResponse.json({ error: "Learning session not found" }, { status: 404 });
    if (learningSession.userId !== userSession.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const learningState = learningSession.learningState as LearningState | null;
    if (!learningState || learningState.sessionId !== body.sessionId) {
      return NextResponse.json({ error: "This session has no valid learning state. Start a new session." }, { status: 409 });
    }
    if (!CONTINUE_STAGES.includes(learningState.stage)) {
      return NextResponse.json({ error: `Continue is not valid during stage '${learningState.stage}'.` }, { status: 409 });
    }

    const lastEvent = await LearningEventModel.findOne({ sessionId: learningSession._id }).sort({ sequence: -1 }).exec();
    const maxSequence = lastEvent?.sequence ?? 0;
    let aiResponse;
    try {
      aiResponse = await continueLearning({ sessionId: body.sessionId, learningState });
    } catch (error) {
      return serviceError(error);
    }

    const conceptName = aiResponse.concept || learningSession.topic;
    const documents = aiResponse.events.map((event, index) => ({
      ...eventDocument(event, learningSession._id, conceptName), sequence: maxSequence + index + 1,
    }));
    if (documents.length === 0) return NextResponse.json({ error: "AI service returned no learning events" }, { status: 502 });

    const insertedEvents = await LearningEventModel.insertMany(documents);
    learningSession.learningState = aiResponse.learningState;
    learningSession.mastery = aiResponse.learningState.mastery;
    if (aiResponse.isComplete) {
      learningSession.status = "completed";
      learningSession.completedAt = new Date();
    }
    learningSession.markModified("learningState");
    await learningSession.save();

    return NextResponse.json({ newEvents: insertedEvents.map(serializeEvent), session: serializeSession(learningSession) });
  } catch (error) {
    console.error("Error continuing learning session:", error);
    return NextResponse.json({ error: "Unable to continue the learning session" }, { status: 500 });
  }
}
