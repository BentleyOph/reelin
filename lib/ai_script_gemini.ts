import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type Scene = {
  description: string;
  duration: number;
};

type ScriptResponse = {
  script: string;
  scenes: Scene[];
};

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    scenes: {
      type: SchemaType.ARRAY,
      description: "List of scenes with descriptions and durations",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: {
            type: SchemaType.STRING,
            description: "Detailed description of the scene for image generation",
            nullable: false,
          },
          duration: {
            type: SchemaType.NUMBER,
            description: "Duration of the scene in seconds",
            nullable: false,
          },
        },
        required: ["description", "duration"],
      },
    },
    script: {
      type: SchemaType.STRING,
      description: "The generated script for the video with emojis",
      nullable: false,
    },
  },
  required: ["script", "scenes"],
};

export async function generateScript(prompt: string): Promise<ScriptResponse> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const result = await model.generateContent(`
      Generate a short-form video script based on the following description.
      
      Follow these rules:
      - Length: 30-60 seconds total
      - Tone: Engaging and conversational
      - Structure: Hook -> Content -> Call to action
      - Include emojis where appropriate
      - Break down into 3-5 scenes
      - Each scene should have a specific duration
      
      IMPORTANT - For scene descriptions:
      - First establish the setting, characters, and their key attributes
      - Each subsequent scene should explicitly reference elements from previous scenes
      - Maintain visual consistency for characters (same appearance, clothing, colors)
      - Explicitly carry over the setting/environment details between scenes
      - Each description should be self-contained but also build on the previous scene
      - Use precise, detailed language optimized for text-to-image generation
      - Include specific details about lighting, camera angle, and mood
      - When characters move or change position, explain their transition from the previous scene
      
      Description: ${prompt}
    `);

    const response = await result.response;
    const parsedResponse = JSON.parse(response.text());
    
    // Return the response with the correct structure
    return {
      script: parsedResponse.script,
      scenes: parsedResponse.scenes,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script");
  }
}