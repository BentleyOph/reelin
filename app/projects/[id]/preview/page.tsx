// app/projects/[id]/preview/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Calendar, 
  ArrowLeft, 
  Edit 
} from "lucide-react";

type Subtitle = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  script: string;
  voiceId: string;
  audioUrl: string;
  mediaUrls: string[];
  subtitles: Subtitle[];
  status: string;
};

export default function ProjectPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch project data
  useEffect(() => {
    // For MVP, use mock data
    // In a real app, fetch from your API
    const fetchProject = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockProject: Project = {
          id: params.id,
          title: "TikTok Fitness Tips",
          description: "Quick workout tips for beginners",
          script: "Here are three quick fitness tips for beginners. First, start with just 10 minutes a day. Second, focus on form over weight. Third, consistency beats intensity.",
          voiceId: "voice2",
          audioUrl: "/samples/voice2.mp3", // Use a sample for MVP
          mediaUrls: [
            "/api/placeholder/800/450",
            "/api/placeholder/800/450",
            "/api/placeholder/800/450"
          ],
          subtitles: [
            { id: "sub1", start: 0, end: 2.5, text: "Here are three quick fitness tips for beginners." },
            { id: "sub2", start: 2.5, end: 5, text: "First, start with just 10 minutes a day." },
            { id: "sub3", start: 5, end: 7.5, text: "Second, focus on form over weight." },
            { id: "sub4", start: 7.5, end: 10, text: "Third, consistency beats intensity." }
          ],
          status: "ready"
        };
        
        setProject(mockProject);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  // Initialize audio and set up event listeners
  useEffect(() => {
    if (project?.audioUrl) {
      const audio = new Audio(project.audioUrl);
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        
        // Update active subtitle
        const currentSubtitle = project.subtitles.find(
          sub => audio.currentTime >= sub.start && audio.currentTime <= sub.end
        ) || null;
        
        setActiveSubtitle(currentSubtitle);
        
        // Calculate which media clip should be shown
        const clipDuration = audio.duration / project.mediaUrls.length;
        const newMediaIndex = Math.min(
          Math.floor(audio.currentTime / clipDuration),
          project.mediaUrls.length - 1
        );
        
        if (newMediaIndex !== activeMediaIndex) {
          setActiveMediaIndex(newMediaIndex);
        }
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audio.currentTime = 0;
      };
      
      return () => {
        audio.pause();
      };
    }
  }, [project, activeMediaIndex]);

  // Play/pause functionality
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle mute functionality
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleDownload = () => {
    alert("Download functionality would be implemented here");
    // In a real app, generate and download the final reel
  };

  const handleShare = () => {
    alert("Share functionality would be implemented here");
    // In a real app, show share options or copy link
  };

  const handleSchedule = () => {
    alert("Schedule functionality would be implemented here");
    // In a real app, show scheduling dialog
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push(`/projects/${params.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {/* Preview Image */}
            <img
              src={project.mediaUrls[activeMediaIndex]}
              alt={`Video frame ${activeMediaIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Subtitle Overlay */}
            {activeSubtitle && (
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <div className="bg-black/60 text-white px-4 py-2 mx-auto inline-block rounded-lg">
                  {activeSubtitle.text}
                </div>
              </div>
            )}

            {/* Play/Pause Overlay */}
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-16 h-16 text-white" />
              ) : (
                <Play className="w-16 h-16 text-white" />
              )}
            </button>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration}
                  step={0.1}
                  onValueChange={handleTimeChange}
                />
              </div>
              <span className="text-sm text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button onClick={handleSchedule}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}