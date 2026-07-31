import mammoth from "mammoth";

export async function parseDocx(
  file: Buffer | ArrayBuffer | Uint8Array | Blob
): Promise<string> {
  let buffer: Buffer;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (file instanceof Blob) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else if (file instanceof Uint8Array) {
    buffer = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
  } else {
    buffer = Buffer.from(file);
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
