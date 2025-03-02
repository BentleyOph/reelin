import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path from the URL segments
    const filePath = join(process.cwd(), "gen_media", ...params.path);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(join(process.cwd(), "gen_media"))) {
      return new NextResponse("Invalid path", { status: 403 });
    }

    try {
      // Check if file exists and get its stats
      const stats = await stat(filePath);
      
      if (!stats.isFile()) {
        return new NextResponse("Not found", { status: 404 });
      }

      // Read the file
      const file = await readFile(filePath);

      // Determine content type
      const contentType = getContentType(filePath);

      // Return the file with appropriate headers
      return new NextResponse(file, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "public, max-age=31536000",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new NextResponse("Not found", { status: 404 });
    }
  } catch (e) {
    console.error("Error serving media file:", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}
