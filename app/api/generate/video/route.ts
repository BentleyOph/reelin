import { NextRequest, NextResponse } from "next/server";
import { convertImageToVideo } from "@/lib/fal_image_to_video";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, projectId } = await req.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Image URL and prompt are required" },
        { status: 400 }
      );
    }

    // Convert the local image URL to absolute URL.
    const absoluteImageUrl = new URL(imageUrl, req.url).toString();

    // Generate video from image
    const { videoUrl, requestId } = await convertImageToVideo(
      absoluteImageUrl,
      prompt
    );

    // Download and save the video locally
    const response = await fetch(videoUrl);
    const videoBuffer = await response.arrayBuffer();

    // Create unique filename
    const filename = `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
    const outputDir = path.join(process.cwd(), "gen_media", "videos");
    await fs.promises.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, filename);
    await fs.promises.writeFile(outputPath, Buffer.from(videoBuffer));

    return NextResponse.json({
      success: true,
      videoUrl: `/api/media/videos/${filename}`,
      requestId,
      projectId,
    });

  } catch (error) {
    console.error("Error in video generation:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
