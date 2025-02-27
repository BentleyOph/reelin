// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Video, Clock, Edit, Trash2, PlayCircle } from "lucide-react";

// Mock data - in a real app, this would come from your API
const MOCK_PROJECTS = [
  {
    id: "1",
    title: "Instagram Coffee Review",
    description: "Short review of specialty coffee brands",
    status: "draft",
    createdAt: "2025-02-25T12:00:00Z",
    thumbnailUrl: "/api/placeholder/400/225"
  },
  {
    id: "2",
    title: "TikTok Fitness Tips",
    description: "Quick workout tips for beginners",
    status: "ready",
    createdAt: "2025-02-24T15:30:00Z",
    thumbnailUrl: "/api/placeholder/400/225"
  }
];

type Project = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "ready";
  createdAt: string;
  thumbnailUrl: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch projects from your API
    // For MVP, use mock data
    setProjects(MOCK_PROJECTS);
    setIsLoading(false);
  }, []);

  const handleDeleteProject = async (id: string) => {
    // In a real app, delete from your API
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Reel Projects</h1>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Reel
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No projects yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new reel</p>
          <Link href="/projects/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Reel
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={project.thumbnailUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                {project.status === "draft" && (
                  <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                    Draft
                  </div>
                )}
                {project.status === "ready" && (
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Ready
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg">{project.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                <div className="flex items-center text-gray-400 text-xs mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 p-4 flex justify-between">
                {project.status === "draft" ? (
                  <Link href={`/projects/${project.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Continue Editing
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/projects/${project.id}/preview`}>
                    <Button variant="outline" size="sm">
                      <PlayCircle className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}