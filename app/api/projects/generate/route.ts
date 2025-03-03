import { NextRequest, NextResponse } from 'next/server';
import { generateFullProject } from '@/lib/project-service';

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Start the generation process - this is async and will take time
    // We'll update the project status as it progresses
    generateFullProject(projectId).catch(error => {
      console.error('Error in project generation process:', error);
    });

    return NextResponse.json({ 
      success: true,
      message: 'Project generation started',
      projectId
    });
  } catch (error) {
    console.error('Error triggering project generation:', error);
    return NextResponse.json(
      { error: 'Failed to start project generation' },
      { status: 500 }
    );
  }
}
