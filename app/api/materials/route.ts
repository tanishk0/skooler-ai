import { dbStore } from "@/lib/db/store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await dbStore.getMaterials();
    return NextResponse.json({ success: true, materials });
  } catch (error: any) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
