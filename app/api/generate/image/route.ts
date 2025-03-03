import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateImage, GeneratedImage } from "@/lib/ai_image_pollinations";
import { generateImageFal } from "@/lib/ai_image_fal";
import { downloadImage } from "@/lib/utils";

type Scene = {
  description: string;
  duration?: number;
};

type RequestBody = {
  script: string;
  scenes: Scene[];
  projectId: string | number;
};

export async function POST(req: NextRequest) {
  try {
    const { script, scenes, projectId } = await req.json() as RequestBody;

    if (!script || !scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: "Script and scenes are required" },
        { status: 400 }
      );
    }

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), "gen_media", "images");
    await fs.promises.mkdir(outputDir, { recursive: true });

    const mediaResults: GeneratedImage[] = [];

    // Generate images for each scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.description) continue;

      try {
        // Try primary service first
        const imageBuffer = await generateImage(scene.description);
        
        // Create a unique filename
        const filename = `scene-${i}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const outputPath = path.join(outputDir, filename);
        await fs.promises.writeFile(outputPath, imageBuffer);

        mediaResults.push({
          prompt: scene.description,
          filename,
          url: `/api/media/images/${filename}`,
          duration: scene.duration || null,
        });
      } catch (primaryError) {
        console.warn("Primary image generation failed, trying fallback:", primaryError);
        
        try {
          // Use FAL.ai as fallback
          const { imageUrl } = await generateImageFal(scene.description);
          
          // Download the image using our helper instead of axios
          const imageBuffer = await downloadImage(imageUrl);
          
          // Create a unique filename
          const filename = `scene-${i}-fal-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
          const outputPath = path.join(outputDir, filename);
          await fs.promises.writeFile(outputPath, imageBuffer);
          
          mediaResults.push({
            prompt: scene.description,
            filename,
            url: `/api/media/images/${filename}`,
            duration: scene.duration || null,
          });
        } catch (fallbackError) {
          console.error("Both image generation services failed:", fallbackError);
          // Continue to next scene instead of failing the entire request
          mediaResults.push({
            prompt: scene.description,
            filename: null,
            url: null,
            duration: scene.duration || null,
            error: "Failed to generate image for this scene"
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      media: mediaResults,
      projectId,
    });
    
  } catch (error) {
    console.error("Error in media generation endpoint:", error);
    return NextResponse.json(
      { error: "Failed to generate media" },
      { status: 500 }
    );
  }
}
