// lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ZyphraClient } from '@zyphra/client';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateScript(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent(`
      Generate a short-form video script based on the following description.
      Follow these rules:
      - Length: 30-60 seconds (3-5 short paragraphs)
      - Tone: Engaging and conversational
      - Structure: Hook -> Content -> Call to action
      - Include emojis where appropriate
      - Avoid markdown formatting

      Description: ${prompt}
    `);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script");
  }
}


