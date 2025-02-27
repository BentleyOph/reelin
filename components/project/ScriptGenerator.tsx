// components/project/ScriptGenerator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type ScriptGeneratorProps = {
  projectId: string;
  projectDescription: string;
  onScriptGenerated: (script: string) => void;
  existingScript?: string;
};

export default function ScriptGenerator({
  projectId,
  projectDescription,
  onScriptGenerated,
  existingScript = "",
}: ScriptGeneratorProps) {
  const [script, setScript] = useState(existingScript);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("generate");

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      // Call your AI API to generate a script based on the project description
      const response = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description: projectDescription }),
      });
      
      if (!response.ok) throw new Error("Failed to generate script");
      
      const data = await response.json();
      setScript(data.script);
      setActiveTab("edit");
    } catch (error) {
      console.error("Error generating script:", error);
      // Handle error (show message to user)
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScript = () => {
    // Save the script (edited or generated) to the project
    onScriptGenerated(script);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Script Generation</CardTitle>
        <CardDescription>
          Generate a script for your reel or write your own
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-6">
          <TabsTrigger value="generate">Generate Script</TabsTrigger>
          <TabsTrigger value="edit">Edit Script</TabsTrigger>
        </TabsList>
        <CardContent>
          <TabsContent value="generate" className="space-y-4">
            <p className="text-sm text-gray-500">
              Our AI will generate a script based on your project description. Click the button below to start.
            </p>
            <Button 
              onClick={generateScript} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Script...
                </>
              ) : (
                "Generate Script"
              )}
            </Button>
          </TabsContent>
          <TabsContent value="edit" className="space-y-4">
            <Textarea
              placeholder="Your script will appear here. You can edit it as needed."
              rows={10}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="font-mono"
            />
          </TabsContent>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveScript} 
            disabled={!script || isGenerating}
            className="ml-auto"
          >
            Save Script & Continue
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}