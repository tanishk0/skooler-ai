import { chunkText } from "@/lib/chunk";
import { embedChunks } from "@/lib/embedding";
import { storeChunks } from "@/lib/pinecone";
import { parsePdf } from "@/lib/parser/pdf";
import { parseTxt } from "@/lib/parser/txt";
import { parseImage } from "@/lib/parser/image";
import { parseDocx } from "@/lib/parser/docx";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    // Parse the file
    let text = "";

    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      text = await parsePdf(buffer);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx") ||
      name.endsWith(".doc")
    ) {
      text = await parseDocx(buffer);
    } else if (file.type === "text/plain" || name.endsWith(".txt")) {
      text = await parseTxt(buffer);
    } else if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/.test(name)) {
      text = await parseImage(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from the file" },
        { status: 400 }
      );
    }

    // 1. Split extracted text into chunks
    const chunks = await chunkText(text);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate text chunks" },
        { status: 400 }
      );
    }

    // 2. Generate vector embeddings for each chunk
    const embeddings = await embedChunks(chunks);

    // 3. Upsert records into Pinecone vector index
    const materialId = `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await storeChunks(materialId, chunks, embeddings);

    return NextResponse.json({
      success: true,
      materialId,
      chunksCount: chunks.length,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}