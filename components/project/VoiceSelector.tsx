// components/project/VoiceSelector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Play, Pause, Loader2 } from "lucide-react";

// Sample voice options - in a real app, these would come from your API
const VOICE_OPTIONS = [
  { id: "voice1", name: "Male - Professional", sample: "/samples/voice1.mp3" },
  { id: "voice2", name: "Female - Enthusiastic", sample: "/samples/voice2.mp3" },
  { id: "voice3", name: "Male - Casual", sample: "/samples/voice3.mp3" },
  { id: "voice4", name: "Female - Professional", sample: "/samples/voice4.mp3" },
];

type VoiceSelectorProps = {
  projectId: string;
  script: string;
  onVoiceGenerated: (voiceId: string, audioUrl: string) => void;
};

export default function VoiceSelector({
  projectId,
  script,
  onVoiceGenerated,
}: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const handlePlaySample = (voiceId: string, sampleUrl: string) => {
    if (playingVoice === voiceId && audioRef) {
      audioRef.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      
      const audio = new Audio(sampleUrl);
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      
      setAudioRef(audio);
      setPlayingVoice(voiceId);
    }
  };

  const generateVoiceover = async () => {
    if (!selectedVoice || !script) return;

    setIsGenerating(true);
    try {
      // Call your AI API to generate audio from the script with the selected voice
      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId, 
          script, 
          voiceId: selectedVoice 
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate voiceover");
      
      const data = await response.json();
      onVoiceGenerated(selectedVoice, data.audioUrl);
    } catch (error) {
      console.error("Error generating voiceover:", error);
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Voice</CardTitle>
        <CardDescription>
          Choose a voice for your voiceover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedVoice} 
          onValueChange={setSelectedVoice}
          className="space-y-4"
        >
          {VOICE_OPTIONS.map((voice) => (
            <div key={voice.id} className="flex items-center justify-between border p-4 rounded-md">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={voice.id} id={voice.id} />
                <Label htmlFor={voice.id} className="cursor-pointer">{voice.name}</Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => handlePlaySample(voice.id, voice.sample)}
              >
                {playingVoice === voice.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playingVoice === voice.id ? "Pause" : "Play Sample"}
              </Button>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateVoiceover} 
          disabled={!selectedVoice || isGenerating}
          className="ml-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Voiceover...
            </>
          ) : (
            "Generate Voiceover"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}