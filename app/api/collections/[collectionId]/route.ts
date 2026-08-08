import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Collection from "@/models/Collection";
import LearningSession from "@/models/LearningSession";

interface RouteParams {
  params: Promise<{ collectionId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { collectionId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const collectionDoc = await Collection.findOne({
      _id: collectionId,
      userId: session.user.id,
    }).exec();

    if (!collectionDoc) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const sessions = await LearningSession.find({
      userId: session.user.id,
      $or: [
        { collectionId: collectionId },
        { collectionId: collectionDoc._id.toString() },
        { collectionId: collectionDoc._id },
      ],
    })
      .sort({ updatedAt: -1 })
      .exec();

    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      topic: s.topic,
      status: s.status,
      mastery: s.mastery || 0,
      updatedAt: s.updatedAt || s.createdAt,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      collection: {
        id: collectionDoc._id.toString(),
        name: collectionDoc.name,
        description: collectionDoc.description || "",
        topicCount: formattedSessions.length,
        createdAt: collectionDoc.createdAt,
        updatedAt: collectionDoc.updatedAt,
      },
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error("Error fetching collection detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { collectionId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { name?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updateData: { name?: string; description?: string } = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name.length < 1 || name.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 1 and 100 characters" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (body.description !== undefined) {
      const description = body.description.trim();
      if (description.length > 300) {
        return NextResponse.json(
          { error: "Description must not exceed 300 characters" },
          { status: 400 }
        );
      }
      updateData.description = description;
    }

    await dbConnect();

    const updatedCollection = await Collection.findOneAndUpdate(
      { _id: collectionId, userId: session.user.id },
      updateData,
      { new: true }
    ).exec();

    if (!updatedCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      collection: {
        id: updatedCollection._id.toString(),
        name: updatedCollection.name,
        description: updatedCollection.description || "",
        updatedAt: updatedCollection.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { collectionId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const deletedCollection = await Collection.findOneAndDelete({
      _id: collectionId,
      userId: session.user.id,
    }).exec();

    if (!deletedCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Reset collectionId to null for all sessions in this collection
    await LearningSession.updateMany(
      {
        userId: session.user.id,
        $or: [
          { collectionId: collectionId },
          { collectionId: deletedCollection._id.toString() },
          { collectionId: deletedCollection._id },
        ],
      },
      { $set: { collectionId: null } }
    ).exec();

    return NextResponse.json({ success: true, id: collectionId });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
