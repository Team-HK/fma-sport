import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Issues short-lived tokens so the browser can upload large files (up to 20 MB)
 * straight to Vercel Blob, bypassing the ~4.5 MB serverless request-body limit.
 * Only signed-in admins can obtain a token.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Non autorisé");
        return {
          allowedContentTypes: ["image/*", "video/*", "application/pdf"],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error("Blob client upload token failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de l'envoi" },
      { status: 400 }
    );
  }
}
