import { RecursiveCharacterTextSplitter, TextSplitter } from "@langchain/textsplitters";


export const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n", "\n", ".", " "],
    chunkSize: 1000,
    chunkOverlap: 150,
});

export async function chunkText(text: string): Promise<string[]> {
    const chunks = await splitter.splitText(text);
    return chunks;
}