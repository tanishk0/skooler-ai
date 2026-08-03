import { chunkText } from "@/lib/chunk";
import { embedChunks } from "@/lib/embedding";
import { storeChunks } from "@/lib/pinecone";
import { parsePdf } from "@/lib/parser/pdf";
import { parseTxt } from "@/lib/parser/txt";
import { parseImage } from "@/lib/parser/image";
import { parseDocx } from "@/lib/parser/docx";
import { extractTopicsAndMetadata } from "@/lib/ai/topics";
import { dbStore } from "@/lib/db/store";
import { IStudyMaterial } from "@/lib/db/models";

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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const name = file.name.toLowerCase();

    // 1. Parse text from file
    let text = "";

    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      text = await parsePdf(uint8Array);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx") ||
      name.endsWith(".doc")
    ) {
      text = await parseDocx(uint8Array);
    } else if (file.type === "text/plain" || name.endsWith(".txt")) {
      text = await parseTxt(uint8Array);
    } else if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/.test(name)) {
      text = await parseImage(uint8Array);
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

    // 2. Chunk text
    const chunks = await chunkText(text);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate text chunks" },
        { status: 400 }
      );
    }

    // 3. Generate embeddings
    const embeddings = await embedChunks(chunks);

    // 4. Upsert records into Pinecone vector index
    const materialId = `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await storeChunks(materialId, chunks, embeddings, file.name);

    // 5. Generate AI topics and metadata summary
    const metadataResult = await extractTopicsAndMetadata(text, file.name);

    // 6. Save Study Material in DB
    const now = new Date().toISOString();
    const materialObj: IStudyMaterial = {
      id: materialId,
      title: metadataResult.title,
      subject: metadataResult.subject,
      fileName: file.name,
      fileType: file.type || "document",
      rawText: text,
      summary: metadataResult.summary,
      topics: metadataResult.topics,
      chunksCount: chunks.length,
      createdAt: now,
      updatedAt: now,
    };

    const savedMaterial = await dbStore.saveMaterial(materialObj);

    return NextResponse.json({
      success: true,
      materialId: savedMaterial.id,
      title: savedMaterial.title,
      subject: savedMaterial.subject,
      topics: savedMaterial.topics,
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