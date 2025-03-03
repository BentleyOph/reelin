import { supabaseAdmin } from './supabase/client';
import { Project, Scene } from '@/types/project';

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
        const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: scene.imageUrl,
            prompt: scene.description,
            projectId
          }),
        });

        if (!videoResponse.ok) {
          console.error('Failed to generate video for scene', scene);
          return scene;
        }

        const videoResult = await videoResponse.json();
        return { ...scene, videoUrl: videoResult.videoUrl };
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
    
    // 8. Update project with generated assets
    const updatedProject: Project = {
      ...project,
      status: 'completed',
      script,
      scenes: scenesWithVideos,
      audioUrl: audioResult.audioUrl
    };

    await supabaseAdmin
      .from('projects')
      .update({
        status: 'completed',
        script,
        scenes: scenesWithVideos,
        audioUrl: audioResult.audioUrl
      })
      .eq('id', projectId);

    return updatedProject;
  } catch (error) {
    console.error('Error generating project:', error);
    await updateProjectStatus(projectId, 'failed');
    throw error;
  }
}

async function updateProjectStatus(projectId: string, status: 'draft' | 'generating' | 'completed' | 'failed') {
  await supabaseAdmin
    .from('projects')
    .update({ status })
    .eq('id', projectId);
}
