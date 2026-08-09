import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningSession from "@/models/LearningSession";
import Collection from "@/models/Collection";

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

    let body: { collectionId?: string | null };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const targetCollectionId = body.collectionId ? body.collectionId.trim() : null;

    await dbConnect();

    // Verify session ownership
    const learningSessionDoc = await LearningSession.findOne({
      _id: id,
      userId: session.user.id,
    }).exec();

    if (!learningSessionDoc) {
      return NextResponse.json(
        { error: "Learning session not found" },
        { status: 404 }
      );
    }

    // If targetCollectionId is provided, verify collection ownership
    if (targetCollectionId) {
      const collectionDoc = await Collection.findOne({
        _id: targetCollectionId,
        userId: session.user.id,
      }).exec();

      if (!collectionDoc) {
        return NextResponse.json(
          { error: "Collection not found or access denied" },
          { status: 404 }
        );
      }
    }

    const updatedSession = await LearningSession.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { collectionId: targetCollectionId },
      { new: true }
    ).exec();

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession ? updatedSession._id.toString() : id,
        collectionId: updatedSession ? updatedSession.collectionId : targetCollectionId,
      },
    });
  } catch (error) {
    console.error("Error updating session collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
