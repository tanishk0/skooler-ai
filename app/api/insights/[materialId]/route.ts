import { dbStore } from "@/lib/db/store";
import { computeStudyInsights } from "@/lib/ai/insights";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;

    const material = await dbStore.getMaterialById(materialId);
    if (!material) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 }
      );
    }

    const sessions = await dbStore.getSessionsByMaterial(materialId);
    const insights = computeStudyInsights(sessions, material.topics || []);

    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    console.error("Insights calculation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to calculate study insights" },
      { status: 500 }
    );
  }
}
