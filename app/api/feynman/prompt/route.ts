import { generateFeynmanPrompt } from "@/lib/ai/feynman";
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

    const promptText = await generateFeynmanPrompt(materialId, topic);

    return NextResponse.json({ success: true, prompt: promptText });
  } catch (error: any) {
    console.error("Feynman prompt error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Feynman prompt" },
      { status: 500 }
    );
  }
}
