import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Collection from "@/models/Collection";
import LearningSession from "@/models/LearningSession";
import CollectionDetailView, {
  CollectionMetadata,
  SerializedCollectionSession,
} from "@/components/collections/CollectionDetailView";

interface PageProps {
  params: Promise<{ collectionId: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { collectionId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  let collectionDoc;
  try {
    collectionDoc = await Collection.findOne({
      _id: collectionId,
      userId: session.user.id,
    }).exec();
  } catch {
    notFound();
  }

  if (!collectionDoc) {
    notFound();
  }

  // Fetch learning sessions in this collection (supporting both string and ObjectId collectionId matches)
  const sessionDocs = await LearningSession.find({
    userId: session.user.id,
    $or: [
      { collectionId: collectionId },
      { collectionId: collectionDoc._id.toString() },
      { collectionId: collectionDoc._id },
    ],
  })
    .sort({ updatedAt: -1 })
    .exec();

  // Fetch sidebar data
  const userCollections = await Collection.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .limit(20)
    .exec();

  const recentSessions = await LearningSession.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .limit(10)
    .exec();

  const serializedCollection: CollectionMetadata = {
    id: collectionDoc._id.toString(),
    name: collectionDoc.name,
    description: collectionDoc.description || "",
    topicCount: sessionDocs.length,
    createdAt: collectionDoc.createdAt.toISOString(),
    updatedAt: collectionDoc.updatedAt.toISOString(),
  };

  const serializedSessions: SerializedCollectionSession[] = sessionDocs.map((s) => ({
    id: s._id.toString(),
    topic: s.topic,
    status: s.status as "in_progress" | "completed",
    mastery: s.mastery || 0,
    updatedAt: (s.updatedAt || s.createdAt || new Date()).toISOString(),
    createdAt: (s.createdAt || new Date()).toISOString(),
  }));

  const sidebarCollections = userCollections.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    href: `/collections/${c._id.toString()}`,
  }));

  const sidebarRecents = recentSessions.map((s) => ({
    id: s._id.toString(),
    title: s.topic,
    href: `/learn/${s._id.toString()}`,
  }));

  return (
    <CollectionDetailView
      userName={session.user.name || "User"}
      initialCollection={serializedCollection}
      initialSessions={serializedSessions}
      initialSidebarCollections={sidebarCollections}
      initialSidebarRecents={sidebarRecents}
    />
  );
}
