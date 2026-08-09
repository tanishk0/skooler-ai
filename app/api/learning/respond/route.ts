import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AIClientError, respondToLearning } from "@/lib/ai/client";
import { FastApiEvent, InteractionResponse, LearningEvent, LearningState } from "@/lib/ai/types";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningEventModel from "@/models/LearningEvent";
import LearningSession from "@/models/LearningSession";

function serviceError(error: unknown) {
  const detail = error instanceof AIClientError ? error.data : undefined;
  const rawMessage = error instanceof AIClientError ? error.message : "Unable to process the response.";
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

function eventDocument(event: FastApiEvent, sessionId: unknown, conceptName: string, parentEventId: unknown) {
  return {
    sessionId,
    parentEventId: event.type === "user_answer" ? parentEventId : null,
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
  return {
    id: session._id.toString(),
    topic: session.topic,
    status: session.status,
    mastery: session.mastery,
    learningState: session.learningState as LearningState,
  };
}

export async function POST(request: NextRequest) {
  const userSession = await auth.api.getSession({ headers: await headers() });
  if (!userSession?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { sessionId?: unknown; eventId?: unknown; response?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const response = body.response as InteractionResponse | undefined;
  if (
    typeof body.sessionId !== "string" ||
    typeof body.eventId !== "string" ||
    !response ||
    typeof response.type !== "string" ||
    typeof response.value !== "string" ||
    !response.value.trim()
  ) {
    return NextResponse.json({ error: "sessionId, eventId, and response are required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const learningSession = await LearningSession.findById(body.sessionId).exec();
    if (!learningSession) return NextResponse.json({ error: "Learning session not found" }, { status: 404 });
    if (learningSession.userId !== userSession.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const learningState = learningSession.learningState as LearningState | null;
    if (!learningState || learningState.sessionId !== body.sessionId) {
      return NextResponse.json({ error: "This session has no valid learning state. Start a new session." }, { status: 409 });
    }
    if (learningState.stage !== "awaiting_understanding_check" && learningState.stage !== "awaiting_interaction_response") {
      return NextResponse.json({ error: `This session is not waiting for a response (stage: ${learningState.stage}).` }, { status: 409 });
    }
    if (!learningState.currentInteraction || response.type !== learningState.currentInteraction.type) {
      return NextResponse.json({ error: "Response does not match the active interaction." }, { status: 409 });
    }

    const activeEvent = await LearningEventModel.findOne({
      _id: body.eventId,
      sessionId: learningSession._id,
      type: learningState.currentInteraction.type,
      conceptId: learningState.currentConceptId ?? "",
      content: learningState.currentInteraction.question,
    }).exec();
    if (!activeEvent) return NextResponse.json({ error: "Active interaction not found or already answered" }, { status: 409 });

    const lastEvent = await LearningEventModel.findOne({ sessionId: learningSession._id }).sort({ sequence: -1 }).exec();
    const maxSequence = lastEvent?.sequence ?? 0;

    let aiResponse;
    try {
      aiResponse = await respondToLearning({
        sessionId: body.sessionId,
        userResponse: response.value.trim(),
        learningState,
      });
    } catch (error) {
      return serviceError(error);
    }

    const conceptName = aiResponse.concept || learningSession.topic;
    const documents = aiResponse.events.map((event, index) => ({
      ...eventDocument(event, learningSession._id, conceptName, activeEvent._id),
      sequence: maxSequence + index + 1,
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
    console.error("Error responding to learning session:", error);
    return NextResponse.json({ error: "Unable to save the response" }, { status: 500 });
  }
}
