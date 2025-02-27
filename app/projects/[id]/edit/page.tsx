// app/projects/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptGenerator from "@/components/project/ScriptGenerator";
import VoiceSelector from "@/components/project/VoiceSelector";
import MediaGenerator from "@/components/project/MediaGenerator";
import SubtitleEditor from "@/components/project/SubtitleEditor";
import Timeline from "@/components/project/Timeline";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  script?: string;
  voiceId?: string;
  audioUrl?: string;
  mediaUrls?: string[];
  subtitles?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
};

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("script");
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
        // Handle error - perhaps redirect to dashboard with error notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleScriptGenerated = async (script: string) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProject({ ...project, script });
      setProject({ ...project, script });
      setActiveTab("voice");
    } catch (error) {
      console.error("Error saving script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceGenerated = async (voiceId: string, audioUrl: string) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProject({ ...project, voiceId, audioUrl });
      setProject({ ...project, voiceId, audioUrl });
      setActiveTab("media");
    } catch (error) {
      console.error("Error saving voiceover:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaGenerated = async (mediaUrls: string[]) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProject({ ...project, mediaUrls });
      setProject({ ...project, mediaUrls });
      setActiveTab("subtitles");
    } catch (error) {
      console.error("Error saving media:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubtitlesGenerated = async (subtitles: any[]) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProject({ ...project, subtitles });
      setProject({ ...project, subtitles });
      setActiveTab("timeline");
    } catch (error) {
      console.error("Error saving subtitles:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimelineCompleted = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      // In a real app, you might have a separate "finalize" API endpoint
      await updateProject({ ...project, status: "ready" });
      router.push(`/projects/${params.id}/preview`);
    } catch (error) {
      console.error("Error finalizing project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = async (updatedProject: any) => {
    // Send update to API
    const response = await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    });
    
    if (!response.ok) throw new Error("Failed to update project");
    
    return await response.json();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Button 
          onClick={() => router.push("/dashboard")}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Determine which tabs are enabled based on project state
  const scriptCompleted = !!project.script;
  const voiceCompleted = !!project.voiceId && !!project.audioUrl;
  const mediaCompleted = !!project.mediaUrls && project.mediaUrls.length > 0;
  const subtitlesCompleted = !!project.subtitles && project.subtitles.length > 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editing: {project.title}</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="script" disabled={isSaving}>
              1. Script
            </TabsTrigger>
            <TabsTrigger value="voice" disabled={!scriptCompleted || isSaving}>
              2. Voice
            </TabsTrigger>
            <TabsTrigger value="media" disabled={!voiceCompleted || isSaving}>
              3. Media
            </TabsTrigger>
            <TabsTrigger value="subtitles" disabled={!mediaCompleted || isSaving}>
              4. Subtitles
            </TabsTrigger>
            <TabsTrigger value="timeline" disabled={!subtitlesCompleted || isSaving}>
              5. Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="script" className="p-4">
            <ScriptGenerator
              projectId={project.id}
              projectDescription={project.description}
              onScriptGenerated={handleScriptGenerated}
              existingScript={project.script || ""}
            />
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => scriptCompleted && setActiveTab("voice")}
                disabled={!scriptCompleted || isSaving}
              >
                Next: Voice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="p-4">
            <VoiceSelector
              projectId={project.id}
              script={project.script || ""}
              onVoiceGenerated={handleVoiceGenerated}
            />
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("script")}
                disabled={isSaving}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                Back: Script
              </Button>
              <Button 
                onClick={() => voiceCompleted && setActiveTab("media")}
                disabled={!voiceCompleted || isSaving}
              >
                Next: Media
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="media" className="p-4">
            <MediaGenerator
              projectId={project.id}
              script={project.script || ""}
              onMediaGenerated={handleMediaGenerated}
              existingMedia={project.mediaUrls}
            />
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("voice")}
                disabled={isSaving}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                Back: Voice
              </Button>
              <Button 
                onClick={() => mediaCompleted && setActiveTab("subtitles")}
                disabled={!mediaCompleted || isSaving}
              >
                Next: Subtitles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="subtitles" className="p-4">
            <SubtitleEditor
              projectId={project.id}
              script={project.script || ""}
              audioUrl={project.audioUrl}
              onSubtitlesGenerated={handleSubtitlesGenerated}
              existingSubtitles={project.subtitles}
            />
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("media")}
                disabled={isSaving}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                Back: Media
              </Button>
              <Button 
                onClick={() => subtitlesCompleted && setActiveTab("timeline")}
                disabled={!subtitlesCompleted || isSaving}
              >
                Next: Timeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="p-4">
            <Timeline
              projectId={project.id}
              audioUrl={project.audioUrl}
              mediaUrls={project.mediaUrls}
              subtitles={project.subtitles}
              onComplete={handleTimelineCompleted}
            />
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={() => setActiveTab("subtitles")}
                disabled={isSaving}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                Back: Subtitles
              </Button>
              <Button 
                onClick={handleTimelineCompleted}
                disabled={isSaving}
              >
                Finish & Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}