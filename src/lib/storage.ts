import "server-only";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";
import { env } from "@/lib/env";

// Private file storage. Uses Vercel Blob (private access) when BLOB_READ_WRITE_TOKEN is
// set; otherwise the local .data/uploads folder, so dev works without an account.
// Files are never served directly; routes check ownership and stream them.

const LOCAL_ROOT = path.join(process.cwd(), ".data", "uploads");

function localPath(key: string) {
  const resolved = path.resolve(LOCAL_ROOT, key);
  if (!resolved.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Invalid storage key");
  return resolved;
}

function blobEnabled() {
  if (env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN is required on Vercel");
  return false;
}

export async function saveFile(key: string, data: Buffer, contentType: string) {
  if (blobEnabled()) {
    await put(key, data, { access: "private", contentType, addRandomSuffix: false });
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

export async function readStoredFile(key: string): Promise<{ body: ReadableStream | Buffer; contentType: string } | null> {
  if (blobEnabled()) {
    const result = await get(key, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return { body: result.stream, contentType: result.blob.contentType };
  }
  try {
    const body = await readFile(localPath(key));
    return { body, contentType: contentTypeFor(key) };
  } catch {
    return null;
  }
}

export async function deleteFile(key: string) {
  if (blobEnabled()) {
    await del(key);
    return;
  }
  await rm(localPath(key), { force: true });
}

/** Every stored file under `prefix`, with its upload time (for orphan sweeps). */
export async function listFiles(prefix: string): Promise<{ key: string; uploadedAt: Date }[]> {
  if (blobEnabled()) {
    const files: { key: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      files.push(...page.blobs.map((b) => ({ key: b.pathname, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return files;
  }
  const root = localPath(prefix.replace(/\/$/, "") || ".");
  const entries = await readdir(root, { recursive: true, withFileTypes: true }).catch(() => []);
  return Promise.all(
    entries
      .filter((e) => e.isFile())
      .map(async (e) => {
        const full = path.join(e.parentPath, e.name);
        return { key: path.relative(LOCAL_ROOT, full).split(path.sep).join("/"), uploadedAt: (await stat(full)).mtime };
      }),
  );
}

function contentTypeFor(key: string) {
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

/** Identifies an image by its magic bytes; never trust the browser's declared type. */
export function sniffImage(data: Buffer): { ext: string; contentType: string } | null {
  if (data.length > 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return { ext: "jpg", contentType: "image/jpeg" };
  if (data.length > 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", contentType: "image/png" };
  }
  return null;
}
