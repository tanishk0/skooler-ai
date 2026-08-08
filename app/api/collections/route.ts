import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Collection from "@/models/Collection";
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

    const collections = await Collection.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .exec();

    // Fetch session counts for each collection
    const collectionIds = collections.map((c) => c._id.toString());
    const sessionCounts = await LearningSession.aggregate([
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
        },
      },
    ]);

    const countMap: Record<string, number> = {};
    sessionCounts.forEach((sc) => {
      if (sc._id) {
        countMap[sc._id.toString()] = sc.count;
      }
    });

    const formattedCollections = collections.map((c) => {
      const id = c._id.toString();
      return {
        id,
        name: c.name,
        description: c.description || "",
        topicCount: countMap[id] || 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ collections: formattedCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const name = body.name?.trim();
    if (!name || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { error: "Collection name is required and must be 1-100 characters" },
        { status: 400 }
      );
    }

    const description = body.description?.trim() || "";
    if (description.length > 300) {
      return NextResponse.json(
        { error: "Description must not exceed 300 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const newCollection = await Collection.create({
      userId: session.user.id,
      name,
      description,
    });

    return NextResponse.json(
      {
        collection: {
          id: newCollection._id.toString(),
          name: newCollection.name,
          description: newCollection.description,
          topicCount: 0,
          createdAt: newCollection.createdAt,
          updatedAt: newCollection.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
