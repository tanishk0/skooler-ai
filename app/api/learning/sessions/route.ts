import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import LearningSession from "@/models/LearningSession";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userSessions = await LearningSession.find({
      userId: session.user.id,
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .exec();

    const formattedSessions = userSessions.map((s) => ({
      id: s._id.toString(),
      topic: s.topic,
      status: s.status,
      mastery: s.mastery,
      createdAt: s.startedAt || s.createdAt,
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error fetching learning sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
