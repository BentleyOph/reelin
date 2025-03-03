import { Project } from '@/types/project';

export async function createProject(title: string, description: string, userId: string) {
  try {
    const response = await fetch(`/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function startProjectGeneration(projectId: string) {
  try {
    const response = await fetch(`/api/projects/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start project generation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting project generation:', error);
    throw error;
  }
}

export async function getProject(id: string): Promise<Project> {
  try {
    const response = await fetch(`/api/projects/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    const data = await response.json();
    return data.project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const response = await fetch(`/api/projects?userId=${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data.projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

export async function updateProject(project: Partial<Project> & { id: string }) {
  try {
    const response = await fetch(`/api/projects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}
