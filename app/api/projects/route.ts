import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ProjectCreateRequest, ProjectUpdateRequest, Project } from '@/types/project';
import { generateFullProject } from '@/lib/project-service';

// Get all projects for a user
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Create a new project
export async function POST(req: NextRequest) {
  try {
    const { title, description, userId } = await req.json() as ProjectCreateRequest & { userId: string };

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: 'Title, description and userId are required' },
        { status: 400 }
      );
    }

    const newProject = {
      title,
      description,
      user_id: userId,
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(newProject)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// Update a project
export async function PUT(req: NextRequest) {
  try {
    const project = await req.json() as ProjectUpdateRequest;
    
    if (!project.id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    delete updateData.id;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', project.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
