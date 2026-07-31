export async function parseTxt(file: Blob | File | string | Uint8Array): Promise<string> {
  if (typeof file === "string") {
    return file;
  }
  if (file instanceof Uint8Array) {
    return new TextDecoder().decode(file);
  }
  return await file.text();
}
