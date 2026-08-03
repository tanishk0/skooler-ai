import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
})

export const index = pc.index(process.env.PINECONE_INDEX!);

export async function storeChunks(
    materialId: string,
    chunks: string[],
    embeddings: number[][],
    fileName?: string
) {
    const records = chunks.map((chunk, index) => ({
        id: `${materialId}-${index}`,
        values: embeddings[index],
        metadata: {
            materialId,
            chunkIndex: index,
            text: chunk,
            fileName: fileName || "Document",
        },
    }));

    await index.upsert({ records });
}

export interface VectorSearchResult {
    id: string;
    score: number;
    text: string;
    fileName: string;
    materialId: string;
    chunkIndex: number;
}

export async function searchChunks(
    queryEmbedding: number[],
    topK: number = 5
): Promise<VectorSearchResult[]> {
    const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
    });

    const matches = queryResponse.matches || [];
    return matches.map((match) => ({
        id: match.id,
        score: match.score ?? 0,
        text: (match.metadata?.text as string) || "",
        fileName: (match.metadata?.fileName as string) || "Document",
        materialId: (match.metadata?.materialId as string) || "",
        chunkIndex: (match.metadata?.chunkIndex as number) ?? 0,
    }));
}
