import { createClient } from "@deepgram/sdk";
import fs from "fs";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

type AudioConfig = {
  model?: string;
  encoding?: string;
  container?: string;
};

export async function generateAudio(text: string, outputPath: string, config?: AudioConfig) {
  try {
    // Make request with provided config or defaults
    const response = await deepgram.speak.request(
      { text },
      {
        model: config?.model || "aura-asteria-en",
        encoding: config?.encoding || "linear16",
        container: config?.container || "wav",
      }
    );

    // Get stream and headers
    const stream = await response.getStream();
    const headers = await response.getHeaders();

    if (!stream) {
      throw new Error("Failed to generate audio stream");
    }

    // Convert stream to buffer
    const buffer = await getAudioBuffer(stream); 

    // Write to file
    await fs.promises.writeFile(outputPath, buffer);

    return {
      success: true,
      path: outputPath,
      headers,
    };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
}

async function getAudioBuffer(response: ReadableStream): Promise<Buffer> {
  const reader = response.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return Buffer.from(dataArray.buffer);
}