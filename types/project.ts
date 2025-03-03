export interface Scene {
  id?: string;
  description: string;
  duration?: number;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  order: number;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  script?: string;
  scenes?: Scene[];
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
}

export interface ProjectUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'generating' | 'completed' | 'failed';
  script?: string;
  scenes?: Scene[];
}
