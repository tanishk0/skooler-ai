import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningSession from "@/models/LearningSession";
import LearningEventModel from "@/models/LearningEvent";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { topic?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const newTopic = body.topic?.trim();
    if (!newTopic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    await dbConnect();

    const updatedSession = await LearningSession.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { topic: newTopic },
      { new: true }
    ).exec();

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession._id.toString(),
        topic: updatedSession.topic,
      },
    });
  } catch (error) {
    console.error("Error renaming learning session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const deletedSession = await LearningSession.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).exec();

    if (!deletedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete associated learning events
    await LearningEventModel.deleteMany({ sessionId: id }).exec();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting learning session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
