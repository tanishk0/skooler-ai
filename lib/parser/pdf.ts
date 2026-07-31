import { extractText, extractImages } from "unpdf";
import { parseImage } from "./image";

export async function parsePdf(pdf: ArrayBuffer | Uint8Array | Blob): Promise<string> {
  let buffer: Uint8Array;
  if (pdf instanceof Blob) {
    buffer = new Uint8Array(await pdf.arrayBuffer());
  } else if (pdf instanceof ArrayBuffer) {
    buffer = new Uint8Array(pdf);
  } else {
    buffer = pdf;
  }

  const { text, totalPages } = await extractText(buffer);
  const directText = Array.isArray(text) ? text.join("\n\n") : text ?? "";

  if (directText.trim().length > 100) {
    return directText.trim();
  }

  const ocrPages: string[] = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
      const images = await extractImages(buffer, page);

      for (const image of images) {
        if (image.width > 20 && image.height > 20) {
          const pageText = await parseImage(image);
          if (pageText.trim()) {
            ocrPages.push(pageText.trim());
          }
        }
      }
    } catch (err) {
      console.warn(`[parsePdf] Failed to extract images on page ${page}:`, err);
    }
  }

  const ocrText = ocrPages.join("\n\n").trim();
  return ocrText || directText.trim();
}