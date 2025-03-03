export type ImageGenerationOptions = {
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
};

export interface GeneratedImage {
  prompt: string;
  filename: string | null;
  url: string | null;
  duration: number | null;
  error?: string;
}

export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<Buffer> {
  const {
    width = 1024,
    height = 1024,
    model = 'flux',
    seed = Math.floor(Math.random() * 1000000)
  } = options;

  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
  
  const response = await fetch(imageUrl);
  console.log(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch image for prompt: ${prompt}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
