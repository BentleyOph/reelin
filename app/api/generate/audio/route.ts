import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { generateAudio } from "@/lib/ai_voice";

export async function POST(req: NextRequest) {
  try {
    const { text, config } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Generate unique filename based on timestamp and random string
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.wav`;
    const outputPath = path.join(process.cwd(), 'gen_audios', 'audio', filename);

    const result = await generateAudio(text, outputPath, config);

    return NextResponse.json({
      success: true,
      audioUrl: `/audio/${filename}`,
      headers: result.headers
    });

  } catch (error) {
    console.error("Error in audio generation route:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
