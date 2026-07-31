import { createWorker } from "tesseract.js";

export interface RawImageInput {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
  channels?: 1 | 3 | 4;
}

export type ImageInput = Blob | ArrayBuffer | Uint8Array | string | RawImageInput;

function rawImageToBmp(raw: RawImageInput): Uint8Array {
  const { data, width, height, channels = 4 } = raw;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const headerSize = fileHeaderSize + dibHeaderSize;

  const imageSize = width * height * 4;
  const fileSize = headerSize + imageSize;

  const buffer = new Uint8Array(fileSize);
  const view = new DataView(buffer.buffer);

  // File Header
  buffer[0] = 0x42; // 'B'
  buffer[1] = 0x4d; // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, headerSize, true);

  // DIB Header (BITMAPINFOHEADER)
  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // Top-down
  view.setUint16(26, 1, true); // Planes
  view.setUint16(28, 32, true); // 32 bpp
  view.setUint32(30, 0, true); // BI_RGB
  view.setUint32(34, imageSize, true);

  let offset = headerSize;

  if (channels === 4) {
    for (let i = 0; i < data.length; i += 4) {
      buffer[offset] = data[i + 2];     // B
      buffer[offset + 1] = data[i + 1]; // G
      buffer[offset + 2] = data[i];     // R
      buffer[offset + 3] = data[i + 3]; // A
      offset += 4;
    }
  } else if (channels === 3) {
    for (let i = 0; i < data.length; i += 3) {
      buffer[offset] = data[i + 2];     // B
      buffer[offset + 1] = data[i + 1]; // G
      buffer[offset + 2] = data[i];     // R
      buffer[offset + 3] = 255;         // A
      offset += 4;
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      buffer[offset] = val;     // B
      buffer[offset + 1] = val; // G
      buffer[offset + 2] = val; // R
      buffer[offset + 3] = 255; // A
      offset += 4;
    }
  }

  return buffer;
}

export async function parseImage(image: ImageInput): Promise<string> {
  const worker = await createWorker("eng");

  let inputData: any = image;

  if (
    typeof image === "object" &&
    image !== null &&
    "data" in image &&
    "width" in image &&
    "height" in image
  ) {
    inputData = rawImageToBmp(image as RawImageInput);
  }

  const {
    data: { text },
  } = await worker.recognize(inputData);

  await worker.terminate();

  return text.trim();
}