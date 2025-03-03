import { fal } from "@fal-ai/client";

export async function generateImageFal(prompt: string, width = 720, height = 1080) {
    const result = await fal.subscribe("fal-ai/recraft-20b", {
        input: {
            prompt,
            "image_size": {
                "width": width,
                "height": height
            },
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        },
    });
    
    return {
        imageUrl: result.data.images[0].url,
        requestId: result.requestId
    };
}