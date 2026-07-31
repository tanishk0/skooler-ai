import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
})

export const index = pc.index(process.env.PINECONE_INDEX!);

export async function storeChunks(
    materialId: string,
    chunks: string[],
    embeddings: number[][]
) {
    const records = chunks.map((chunk, index) => ({
        id: `${materialId}-${index}`,
        values: embeddings[index],
        metadata: {
            materialId,
            chunkIndex: index,
            text: chunk,
        },
    }));

    await index.upsert({ records });
}

