import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import LearningSession from "@/models/LearningSession";
import Collection from "@/models/Collection";
import DashboardView from "@/components/dashboard/DashboardView";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  let userSessions: Array<{
    id: string;
    topic: string;
    mastery?: number | null;
    status?: string;
  }> = [];

  let userCollections: Array<{
    id: string;
    name: string;
    description?: string;
    topicCount?: number;
    progress?: number | null;
  }> = [];

  try {
    await dbConnect();
    const docs = await LearningSession.find({
      userId: session.user.id,
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .exec();

    userSessions = docs.map((doc) => ({
      id: doc._id.toString(),
      topic: doc.topic,
      mastery: doc.status === "completed" ? 100 : (typeof doc.mastery === "number" ? doc.mastery : null),
      status: doc.status || "in_progress",
    }));

    const collectionDocs = await Collection.find({
      userId: session.user.id,
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .exec();

    const collectionIds = collectionDocs.map((c) => c._id.toString());
    const counts = await LearningSession.aggregate([
      {
        $match: {
          userId: session.user.id,
          collectionId: { $in: collectionIds },
        },
      },
      {
        $group: {
          _id: "$collectionId",
          count: { $sum: 1 },
          avgMastery: { $avg: "$mastery" },
        },
      },
    ]);

    const countMap: Record<string, { count: number; avgMastery: number | null }> = {};
    counts.forEach((c) => {
      if (c._id) {
        countMap[c._id.toString()] = {
          count: c.count,
          avgMastery: typeof c.avgMastery === "number" ? Math.round(c.avgMastery) : null,
        };
      }
    });

    userCollections = collectionDocs.map((doc) => {
      const stats = countMap[doc._id.toString()];
      return {
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description || "",
        topicCount: stats?.count || 0,
        progress: stats?.avgMastery ?? null,
      };
    });
  } catch (err) {
    console.error("Error fetching initial dashboard data:", err);
  }

  return (
    <DashboardView
      userName={session.user.name || "User"}
      initialSessions={userSessions}
      initialCollections={userCollections}
    />
  );
}