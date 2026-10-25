// Client-side receipt prep: downscale and re-encode so uploads stay small (Server
// Action bodies cap at 1 MB) and OCR runs fast. Also strips EXIF (incl. GPS) since
// the canvas only carries pixels.

const MAX_DIMENSION = 1600;
const MAX_BYTES = 850_000;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareReceiptImage(file: File): Promise<{ file: File; canvas: HTMLCanvasElement }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // Safari can't encode WebP and silently returns PNG; fall back to JPEG then.
    let blob = await toBlob(canvas, "image/webp", 0.8);
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.8);
    if (blob && blob.size <= MAX_BYTES) {
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      bitmap.close();
      return { file: new File([blob], `receipt.${ext}`, { type: blob.type }), canvas };
    }
    scale *= 0.75;
  }
  bitmap.close();
  throw new Error("Couldn't shrink that image enough. Try a closer photo.");
}

export type OcrProgress = { status: string; progress: number };

/** Runs Tesseract in a Web Worker in the visitor's browser; nothing is sent to a server. */
export async function recognizeText(image: HTMLCanvasElement, onProgress: (p: OcrProgress) => void) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => onProgress({ status: m.status, progress: m.progress }),
  });
  try {
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
