// app/api/generate/script/route.ts
import { NextResponse,NextRequest } from "next/server";
import { generateScript } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { projectId, description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const script = await generateScript(description);

    return NextResponse.json({
      script,
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