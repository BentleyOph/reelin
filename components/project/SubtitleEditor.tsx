// components/project/SubtitleEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";

type Subtitle = {
  id: string;
  start: number;
  end: number;
  text: string;
};

type SubtitleEditorProps = {
  projectId: string;
  script: string;
  audioUrl: string;
  onSubtitlesGenerated: (subtitles: Subtitle[]) => void;
  existingSubtitles?: Subtitle[];
};

export default function SubtitleEditor({
  projectId,
  script,
  audioUrl,
  onSubtitlesGenerated,
  existingSubtitles = [],
}: SubtitleEditorProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>(existingSubtitles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for preview
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      
      return () => {
        audio.pause();
      };
    }
  }, [audioUrl]);

  const generateSubtitles = async () => {
    setIsGenerating(true);
    try {
      // In a real app, call your AI API to generate subtitles from script and audio
      // For MVP, we'll simulate with a timeout and generate basic subtitles
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create simulated subtitles by splitting script into sentences
      const sentences = script
        .replace(/([.!?])\s*(?=[A-Z])/g, "$1|")
        .split("|")
        .filter(s => s.trim().length > 0);
      
      const mockSubtitles: Subtitle[] = [];
      let currentTime = 0;
      
      sentences.forEach((sentence, index) => {
        // Estimate duration based on word count (approx 0.3s per word)
        const wordCount = sentence.split(/\s+/).length;
        const duration = Math.max(1, wordCount * 0.3);
        
        mockSubtitles.push({
          id: `subtitle-${index}`,
          start: currentTime,
          end: currentTime + duration,
          text: sentence.trim()
        });
        
        currentTime += duration;
      });
      
      setSubtitles(mockSubtitles);
    } catch (error) {
      console.error("Error generating subtitles:", error);
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSubtitle = (id: string, field: keyof Subtitle, value: any) => {
    setSubtitles(subtitles.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  const playSubtitleAudio = (subtitle: Subtitle) => {
    if (!audioElement) return;
    
    audioElement.currentTime = subtitle.start;
    audioElement.play();
    
    // Stop playing after subtitle duration
    const duration = subtitle.end - subtitle.start;
    setTimeout(() => {
      audioElement.pause();
    }, duration * 1000);
  };

  const handleSaveSubtitles = () => {
    onSubtitlesGenerated(subtitles);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subtitle Editor</CardTitle>
        <CardDescription>
          Generate and edit subtitles for your reel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subtitles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No subtitles yet. Generate them automatically from your script and audio.
            </p>
            <Button 
              onClick={generateSubtitles} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Subtitles...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Subtitles
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col max-h-96 overflow-y-auto border rounded-md">
              {subtitles.map((subtitle) => (
                <div 
                  key={subtitle.id}
                  className={`p-3 border-b cursor-pointer flex justify-between ${
                    selectedSubtitle === subtitle.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSubtitle(subtitle.id)}
                >
                  <div>
                    <div className="text-sm font-medium">{subtitle.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(subtitle.start)} → {formatTime(subtitle.end)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSubtitleAudio(subtitle);
                    }}
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
            
            {selectedSubtitle && (
              <div className="border rounded-md p-4 space-y-3">
                <h3 className="text-sm font-medium">Edit Subtitle</h3>
                
                {subtitles.find(s => s.id === selectedSubtitle) && (
                  <>
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <label className="text-xs font-medium">Start Time</label>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.1"
                          value={subtitles.find(s => s.id === selectedSubtitle)?.start} 
                          onChange={(e) => updateSubtitle(selectedSubtitle, 'start', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-medium">End Time</label>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.1"
                          value={subtitles.find(s => s.id === selectedSubtitle)?.end} 
                          onChange={(e) => updateSubtitle(selectedSubtitle, 'end', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium">Text</label>
                      <Textarea 
                        value={subtitles.find(s => s.id === selectedSubtitle)?.text} 
                        onChange={(e) => updateSubtitle(selectedSubtitle, 'text', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSubtitles} 
          disabled={subtitles.length === 0 || isGenerating}
          className="ml-auto"
        >
          Save Subtitles & Continue
        </Button>
      </CardFooter>
    </Card>
  );
}