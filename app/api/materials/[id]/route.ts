import { dbStore } from "@/lib/db/store";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await dbStore.getMaterialById(id);

    if (!material) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbStore.deleteMaterial(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete material" },
      { status: 500 }
    );
  }
}
