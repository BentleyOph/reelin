// app/projects/[id]/preview/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Share } from 'lucide-react';
import { getProject } from '@/lib/project-helpers';
import { Project } from '@/types/project';

export default function PreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const projectData = await getProject(params.id);
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleExport = async () => {
    if (!project) return;
    
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    
    try {
      // Call the API endpoint to generate the video
      const response = await fetch(`/api/generate/export-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: params.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export video');
      }

      // Set up SSE for progress updates if needed
      const data = await response.json();
      setVideoUrl(data.videoUrl);
    } catch (error) {
      console.error('Error exporting video:', error);
      setExportError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    
    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${project?.title || 'reel'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!videoUrl) return;
    
    // For now, just copy the URL to clipboard
    // In a production app, you might integrate with social media sharing APIs
    try {
      await navigator.clipboard.writeText(videoUrl);
      alert('Video URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Project not found</h1>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Preview: {project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-md overflow-hidden mb-4">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full"
                poster={project.media?.[0]?.url}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>Export your reel to preview the final video</p>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Description:</h3>
            <p className="text-sm text-gray-700">{project.description}</p>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">Exporting: {exportProgress}%</p>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-md text-red-700 mb-4">
              {exportError}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/projects/${params.id}/edit`)}
          >
            Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Generate Video'
              )}
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={!videoUrl} 
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={!videoUrl} 
              variant="outline"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}