import { fal } from "@fal-ai/client";
import path from "path";
import fs from "fs/promises";

type VideoResult = {
  videoUrl: string;
  requestId: string;
};

export async function convertImageToVideo(
  imageUrl: string,
  prompt: string
): Promise<VideoResult> {
  try {
    // Handle local API URLs by reading directly from the gen_media directory
    if (imageUrl.includes('/api/media/images/')) {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      if (!filename) {
        throw new Error("Invalid image URL format");
      }

      // Read the file from gen_media/images
      const imagePath = path.join(process.cwd(), 'gen_media', 'images', filename);
      const imageBuffer = await fs.readFile(imagePath);
      
      // Create a File object from the buffer
      const file = new File([imageBuffer], filename, { type: 'image/png' });
      
      // Upload to FAL storage
      const uploadedUrl = await fal.storage.upload(file);
      imageUrl = uploadedUrl; // Use the uploaded URL for video generation
    }

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt,
        image_url: imageUrl
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Processing video:", update.logs.map(log => log.message));
        }
      },
    });

    if (!result.data?.video?.url) {
      throw new Error("No video URL in response");
    }

    return {
      videoUrl: result.data.video.url,
      requestId: result.requestId
    };
  } catch (error) {
    console.error("Error in image to video conversion:", error);
    throw error;
  }
}
