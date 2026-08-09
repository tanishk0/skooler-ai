import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import LearningSession from "@/models/LearningSession";
import LearningEventModel from "@/models/LearningEvent";
import { LearningEvent } from "@/lib/ai/types";
import LearningSessionWorkspace, {
  SerializedSession,
} from "@/components/learning/LearningSessionWorkspace";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function LearningSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  let learningSessionDoc;
  try {
    learningSessionDoc = await LearningSession.findById(sessionId).exec();
  } catch {
    notFound();
  }

  if (!learningSessionDoc) {
    notFound();
  }

  // Security Verification: Ensure the user owns this learning session
  if (learningSessionDoc.userId !== session.user.id) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-6">
        <div className="p-6 rounded-md bg-red-50 border border-red-200 text-red-800 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-1">Access Denied</h2>
          <p className="text-xs text-red-600">
            You do not have permission to access this learning session.
          </p>
        </div>
      </div>
    );
  }

  // Load append-only learning timeline events deterministically ordered by sequence
  const eventDocs = await LearningEventModel.find({ sessionId: learningSessionDoc._id })
    .sort({ sequence: 1 })
    .exec();

  // Load user's recent sessions for sidebar
  const recentSessionDocs = await LearningSession.find({
    userId: session.user.id,
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .exec();

  const serializedSession: SerializedSession = {
    id: learningSessionDoc._id.toString(),
    topic: learningSessionDoc.topic,
    status: learningSessionDoc.status,
    mastery: learningSessionDoc.mastery || 0,
    learningState: learningSessionDoc.learningState || null,
  };

  const serializedEvents = eventDocs.map((e) => ({
    _id: e._id.toString(),
    sessionId: e.sessionId.toString(),
    parentEventId: e.parentEventId ? e.parentEventId.toString() : null,
    sequence: e.sequence,
    type: e.type as LearningEvent["type"],
    role: e.role as "assistant" | "user",
    content: e.content,
    moduleId: e.moduleId || null,
    conceptId: e.conceptId || null,
    conceptName: e.conceptName || null,
    metadata: e.metadata || null,
    createdAt: e.createdAt.toISOString(),
  })) as unknown as LearningEvent[];

  const recentSessions = recentSessionDocs.map((s) => ({
    id: s._id.toString(),
    topic: s.topic,
  }));

  return (
    <LearningSessionWorkspace
      userName={session.user.name || "User"}
      initialSession={serializedSession}
      initialEvents={serializedEvents}
      recentSessions={recentSessions}
    />
  );
}
