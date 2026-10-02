import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filename = segments.join("/");

  if (filename.includes("..") || path.isAbsolute(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
