// app/api/generate/script/route.ts
import { NextResponse, NextRequest } from "next/server";
import { generateScript } from "@/lib/ai_script_gemini";

export async function POST(request: NextRequest) {
  try {
    const { projectId, description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const result = await generateScript(description);

    // Return the response with the correct structure
    return NextResponse.json({
      ...result,
      projectId,
    });
    
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}