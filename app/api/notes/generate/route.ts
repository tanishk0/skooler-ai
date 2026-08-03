import { dbStore } from "@/lib/db/store";
import { generateShortNotes } from "@/lib/ai/notes";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { materialId, topic } = await req.json();

    if (!materialId || !topic) {
      return NextResponse.json(
        { error: "materialId and topic are required" },
        { status: 400 }
      );
    }

    const material = await dbStore.getMaterialById(materialId);
    const note = await generateShortNotes(
      materialId,
      topic,
      material?.rawText
    );

    const savedNote = await dbStore.saveShortNote(note);

    return NextResponse.json({ success: true, note: savedNote });
  } catch (error: any) {
    console.error("Notes generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate short notes" },
      { status: 500 }
    );
  }
}
