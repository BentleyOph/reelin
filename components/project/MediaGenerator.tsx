// components/project/MediaGenerator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, RefreshCw } from "lucide-react";

type MediaGeneratorProps = {
  projectId: string;
  script: string;
  onMediaGenerated: (mediaUrls: string[]) => void;
};

export default function MediaGenerator({
  projectId,
  script,
  onMediaGenerated,
}: MediaGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedMedia, setGeneratedMedia] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);

  const generateMediaFromScript = async () => {
    setIsGenerating(true);
    try {
      // Call your AI API to generate media clips based on the script
      const response = await fetch("/api/generate/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId, 
          script,
          customPrompt: customPrompt.trim() ? customPrompt : undefined
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate media");
      
      const data = await response.json();
      setGeneratedMedia(data.mediaUrls);
    } catch (error) {
      console.error("Error generating media:", error);
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    
    // Create FormData for upload
    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });
    formData.append('projectId', projectId);
    
    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to upload media");
      
      const data = await response.json();
      setUploadedMedia([...uploadedMedia, ...data.mediaUrls]);
    } catch (error) {
      console.error("Error uploading media:", error);
      // Handle error
    }
  };

  const handleSaveMedia = () => {
    // Combine generated and uploaded media
    const allMedia = [...generatedMedia, ...uploadedMedia];
    onMediaGenerated(allMedia);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Selection</CardTitle>
        <CardDescription>
          Generate video clips or upload your own media
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-6">
          <TabsTrigger value="generate">Generate Media</TabsTrigger>
          <TabsTrigger value="upload">Upload Media</TabsTrigger>
        </TabsList>
        <CardContent>
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="custom-prompt" className="text-sm font-medium">
                Custom Prompt (Optional)
              </label>
              <Textarea
                id="custom-prompt"
                placeholder="Enter specific instructions for media generation (e.g., 'urban cityscape', 'nature scenes')"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave blank to automatically generate media based on your script.
              </p>
            </div>
            
            <Button 
              onClick={generateMediaFromScript} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Media...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Media
                </>
              )}
            </Button>
            
            {generatedMedia.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Generated Media Clips</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedMedia.map((url, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <video 
                        src={url} 
                        className="w-full h-full object-cover" 
                        controls
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Upload your own videos or images
              </p>
              <Input
                type="file"
                accept="video/*,image/*"
                multiple
                className="mt-4"
                onChange={handleFileUpload}
              />
            </div>
            
            {uploadedMedia.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Uploaded Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedMedia.map((url, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      {url.endsWith('.mp4') || url.endsWith('.mov') ? (
                        <video 
                          src={url} 
                          className="w-full h-full object-cover" 
                          controls
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Uploaded media ${index}`}
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveMedia} 
            disabled={generatedMedia.length === 0 && uploadedMedia.length === 0}
            className="ml-auto"
          >
            Save & Continue
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}