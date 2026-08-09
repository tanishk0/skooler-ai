import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AIClientError, startLearning, validateTopic } from "@/lib/ai/client";
import { FastApiEvent, LearningEvent } from "@/lib/ai/types";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Collection from "@/models/Collection";
import LearningEventModel from "@/models/LearningEvent";
import LearningSession from "@/models/LearningSession";

function serviceError(error: unknown) {
  const detail = error instanceof AIClientError ? error.data : undefined;
  const rawMessage = error instanceof AIClientError ? error.message : "Unable to reach the AI teaching service.";
  const status = error instanceof AIClientError && error.status ? error.status : 503;
  let message = rawMessage;
  if (detail && typeof detail === "object" && "detail" in detail && typeof (detail as { detail: unknown }).detail === "string") {
    message = (detail as { detail: string }).detail;
  } else if (typeof detail === "string" && detail.trim()) {
    message = detail.trim();
  }
  return NextResponse.json({ error: message, detail }, { status });
}

function eventDocument(event: FastApiEvent, sessionId: unknown, conceptName: string) {
  return {
    sessionId,
    type: event.type,
    role: event.type === "user_answer" ? "user" : "assistant",
    moduleId: event.moduleId ?? null,
    conceptId: event.conceptId ?? "",
    conceptName,
    content: event.content || event.question || "",
    metadata: {
      ...event.metadata,
      options: event.options,
    },
  };
}

export async function POST(request: NextRequest) {
  const userSession = await auth.api.getSession({ headers: await headers() });
  if (!userSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const topic = typeof (body as { topic?: unknown }).topic === "string"
    ? (body as { topic: string }).topic.trim()
    : "";
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const rawCollectionId = typeof (body as { collectionId?: unknown }).collectionId === "string"
    ? (body as { collectionId: string }).collectionId.trim()
    : null;

  try {
    // Validate before opening a MongoDB session so gibberish never creates a record.
    const validation = await validateTopic({ topic });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message || "Please enter a real concept to learn." },
        { status: 422 },
      );
    }
    const normalizedTopic = validation.normalizedTopic || topic;

    await dbConnect();

    let verifiedCollectionId: string | null = null;
    if (rawCollectionId) {
      const collectionDoc = await Collection.findOne({
        _id: rawCollectionId,
        userId: userSession.user.id,
      }).exec();
      if (collectionDoc) {
        verifiedCollectionId = collectionDoc._id.toString();
      }
    }

    const learningSession = await LearningSession.create({
      userId: userSession.user.id,
      topic: normalizedTopic,
      collectionId: verifiedCollectionId,
    });
    const sessionId = learningSession._id.toString();

    let aiResponse;
    try {
      aiResponse = await startLearning({ sessionId, inputType: "topic", topic: normalizedTopic });
    } catch (error) {
      // A session without authoritative backend state cannot be resumed safely.
      await learningSession.deleteOne();
      return serviceError(error);
    }

    const conceptName = aiResponse.concept || normalizedTopic;
    const events = aiResponse.events.map((event, index) => ({
      ...eventDocument(event, learningSession._id, conceptName),
      sequence: index + 1,
    }));

    if (events.length === 0) {
      await learningSession.deleteOne();
      return NextResponse.json({ error: "AI service returned no learning events" }, { status: 502 });
    }

    await LearningEventModel.insertMany(events);
    learningSession.learningState = aiResponse.learningState;
    learningSession.mastery = aiResponse.learningState.mastery;
    learningSession.markModified("learningState");
    await learningSession.save();

    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error) {
    console.error("Error starting learning session:", error);
    return NextResponse.json({ error: "Unable to start the learning session" }, { status: 500 });
  }
}
