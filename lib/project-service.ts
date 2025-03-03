import { supabaseAdmin } from './supabase/client';
import { Project, Scene } from '@/types/project';
import { getWordTimestamps } from './ai_voice';
import fs from 'fs';
import path from 'path';

export async function generateFullProject(projectId: string): Promise<Project> {
  try {
    // 1. Get project from database
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      throw new Error(`Project not found: ${error?.message}`);
    }

    // 2. Update project status to generating
    await updateProjectStatus(projectId, 'generating');

    // 3. Generate script
    const scriptResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        description: project.description,
        projectId: project.id
      }),
    });

    if (!scriptResponse.ok) {
      throw new Error('Failed to generate script');
    }
    
    const scriptResult = await scriptResponse.json();
    const { script, scenes } = scriptResult;
    
    // 4. Update project with script
    await supabaseAdmin
      .from('projects')
      .update({ script })
      .eq('id', projectId);
    
    // 5. Generate images for each scene
    const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script,
        scenes,
        projectId
      }),
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to generate images');
    }

    const imageResult = await imageResponse.json();
    const scenesWithImages = imageResult.media.map((media: any, index: number) => ({
      description: scenes[index].description,
      duration: scenes[index].duration || 5,
      imageUrl: media.url,
      order: index
    }));

    // 6. Generate video for each image
    const scenesWithVideos = await Promise.all(
      scenesWithImages.map(async (scene: Scene) => {
        // const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/video`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     imageUrl: scene.imageUrl,
        //     prompt: scene.description,
        //     projectId
        //   }),
        // });

        // if (!videoResponse.ok) {
        //   console.error('Failed to generate video for scene', scene);
        //   return scene;
        // }

        // const videoResult = await videoResponse.json();
        // return { ...scene, videoUrl: videoResult.videoUrl };
        // For now, just return the scene with a mock video URL
        // Mock a video URL using the image URL but with a different extension
        const imageUrlParts = scene.imageUrl.split('.');
        const baseUrl = imageUrlParts.join('.');
        const mockVideoUrl = `${baseUrl}_video.mp4`;

        console.log(`[MOCK] Video would be generated for ${scene.description}`);
        return { ...scene, videoUrl: mockVideoUrl };
      })
    );

    // 7. Generate audio for the narration
    const audioResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: script,
        config: { voice: 'en-US-Neural2-F' }
      }),
    });

    if (!audioResponse.ok) {
      throw new Error('Failed to generate audio');
    }

    const audioResult = await audioResponse.json();
    
    // 8. Generate word timestamps from the audio
    console.log(`Processing audio from: ${audioResult.audioUrl}`);
    const audioFilePath = await downloadAudio(audioResult.audioUrl, projectId);
    console.log(`Audio file path for timestamp generation: ${audioFilePath}`);
    
    // Ensure the transcripts directory exists
    const transcriptsDir = path.join(process.cwd(), 'gen_media', 'transcripts');
    await fs.promises.mkdir(transcriptsDir, { recursive: true });

    // Generate timestamps and save to file
    const timestamps = await getWordTimestamps(audioFilePath);
    const transcriptFilePath = path.join(transcriptsDir, `${projectId}.json`);
    await fs.promises.writeFile(transcriptFilePath, JSON.stringify(timestamps, null, 2));
    
    // Create a URL for the transcript file
    const transcriptUrl = `/api/media/transcripts/${projectId}.json`;
    console.log(transcriptUrl);
    
    // Add transcript URL AND audio URL to each scene
    const scenesWithTranscripts = scenesWithVideos.map(scene => ({
      ...scene,
      transcriptUrl,
      audioUrl: audioResult.audioUrl // Add the audio URL to each scene
    }));
    console.log(scenesWithTranscripts);

    // 9. Update project with generated assets
    const updatedProject: Project = {
      ...project,
      status: 'completed',
      script,
      scenes: scenesWithTranscripts
      // No longer maintaining audioUrl at the project level
    };
    console.log(updatedProject);

    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        status: 'completed',
        script,
        scenes: scenesWithTranscripts
        // Removed audioUrl from project update
      })
      .eq('id', projectId);
    
    if (updateError) {
      console.error('Error updating project in database:', updateError);
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    return updatedProject;
  } catch (error) {
    console.error('Error generating project:', error);
    await updateProjectStatus(projectId, 'failed');
    throw error;
  }
}

// Helper function to download audio file if it's a URL
async function downloadAudio(audioUrl: string, projectId: string): Promise<string> {
  try {
    // Check if it's an API URL (starts with /api/) and convert to filesystem path
    if (audioUrl.startsWith('/api/media/')) {
      // Map from API URL to actual file path
      const relativePath = audioUrl.replace('/api/media/', '');
      const absolutePath = path.join(process.cwd(), 'gen_media', relativePath);
      
      // Check if the file exists
      if (fs.existsSync(absolutePath)) {
        console.log(`Using existing audio file at: ${absolutePath}`);
        return absolutePath;
      }
      console.warn(`Audio file not found at: ${absolutePath}, attempting to download from full URL`);
    }

    // If it's an external URL or file wasn't found locally
    const fullUrl = audioUrl.startsWith('http') 
      ? audioUrl 
      : `${process.env.NEXT_PUBLIC_BASE_URL}${audioUrl}`;
    
    console.log(`Downloading audio from: ${fullUrl}`);
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download audio. Status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to a predictable location using project ID
    const outputPath = path.join(process.cwd(), 'gen_media', 'audio', `${projectId}.wav`);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, buffer);
    
    console.log(`Audio downloaded and saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error downloading audio: ${error}`);
    throw error;
  }
}

async function updateProjectStatus(projectId: string, status: 'draft' | 'generating' | 'completed' | 'failed') {
  await supabaseAdmin
    .from('projects')
    .update({ status })
    .eq('id', projectId);
}
