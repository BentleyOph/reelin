// components/project/Timeline.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Download, CheckCircle } from "lucide-react";

type Subtitle = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type TimelineProps = {
  projectId: string;
  audioUrl: string;
  mediaUrls: string[];
  subtitles: Subtitle[];
  onComplete: () => void;
};

export default function Timeline({
  projectId,
  audioUrl,
  mediaUrls,
  subtitles,
  onComplete,
}: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio and get duration
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        
        // Update active subtitle
        const currentSubtitle = subtitles.find(
          sub => audio.currentTime >= sub.start && audio.currentTime <= sub.end
        ) || null;
        
        setActiveSubtitle(currentSubtitle);
        
        // Calculate which media clip should be shown
        const clipDuration = audio.duration / mediaUrls.length;
        const newMediaIndex = Math.min(
          Math.floor(audio.currentTime / clipDuration),
          mediaUrls.length - 1
        );
        
        if (newMediaIndex !== activeMediaIndex) {
          setActiveMediaIndex(newMediaIndex);
        }
      };
      
      return () => {
        audio.pause();
      };
    }
  }, [audioUrl, subtitles, mediaUrls.length]);

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

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export process with progress updates
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(i * 10);
    }
    
    setIsExporting(false);
    setExportComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Preview and finalize your reel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video rounded-md overflow-hidden bg-black relative">
          {/* Media display */}
          <img 
            src={mediaUrls[activeMediaIndex]} 
            alt="Preview"
            className="w-full h-full object-cover"
          />
          
          {/* Subtitles overlay */}
          {activeSubtitle && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <div className="bg-black bg-opacity-50 text-white mx-auto max-w-md p-2 rounded text-lg font-medium">
                {activeSubtitle.text}
              </div>
            </div>
          )}
          
          {/* Play/pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-16 w-16 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-40"
                onClick={handlePlayPause}
              >
                <Play className="h-8 w-8" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Timeline controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleTimeChange}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <span className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {/* Export controls */}
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Export Your Reel</h3>
          
          {exportComplete ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Export complete! Your reel is ready to download or share.</span>
            </div>
          ) : isExporting ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">Exporting reel: {exportProgress}% complete</p>
            </div>
          ) : (
            <Button 
              className="w-full"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Reel
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onComplete}
          disabled={isExporting && !exportComplete}
          className="ml-auto"
        >
          {exportComplete ? "Finish & Return to Dashboard" : "Save & Finish"}
        </Button>
      </CardFooter>
    </Card>
  );
}