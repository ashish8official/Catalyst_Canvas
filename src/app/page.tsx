
"use client";

import React, { useState } from "react";
import { EditorSurface } from "@/components/editor/EditorSurface";
import { PromptConsole } from "@/components/ai/PromptConsole";
import { AIOutputDisplay } from "@/components/ai/AIOutputDisplay";
import { generateNewContentFromPrompt } from "@/ai/flows/generate-new-content-from-prompt";
import { refineSelectedText } from "@/ai/flows/refine-selected-text-flow";
import { explainOrFixSelectedCode } from "@/ai/flows/explain-or-fix-selected-code";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Cpu, PanelLeft, Settings, UserCircle, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CatalystCanvas() {
  const { toast } = useToast();
  const [content, setContent] = useState("// Welcome to Catalyst Canvas\n// The context-aware intelligent workspace.\n\nfunction helloWorld() {\n  console.log(\"Start creating with AI power...\");\n}");
  const [selection, setSelection] = useState("");
  const [mode, setMode] = useState<"text" | "code">("code");
  const [language, setLanguage] = useState("TypeScript");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setPromptHistory(prev => [prompt, ...prev]);
    try {
      if (selection) {
        // Contextual Refinement
        const result = await refineSelectedText({
          selectedText: selection,
          refinementPrompt: prompt
        });
        setAiOutput(result.refinedText);
      } else {
        // Fresh Generation
        const result = await generateNewContentFromPrompt({ prompt });
        setAiOutput(result.generatedContent);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "An error occurred while communicating with the AI engine."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebug = async () => {
    if (!selection) {
      toast({
        title: "No Code Selected",
        description: "Please highlight a snippet of code to debug."
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await explainOrFixSelectedCode({
        codeSnippet: selection,
        action: "fix_or_improve",
        language: language.toLowerCase()
      });
      setAiOutput(result.explanationOrFix);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Debug Failed",
        description: "Unable to process the code snippet for debugging."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineQuick = async () => {
    if (!selection) {
      toast({
        title: "Nothing Selected",
        description: "Highlight text to apply rapid AI refinement."
      });
      return;
    }
    handleGenerate("Refine and improve this content while maintaining context.");
  };

  const applyAIChange = () => {
    if (selection) {
      setContent(prev => prev.replace(selection, aiOutput));
    } else {
      setContent(prev => prev + "\n\n" + aiOutput);
    }
    setAiOutput("");
    setSelection("");
    toast({
      title: "Content Updated",
      description: "AI suggestion has been successfully integrated."
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* App Sidebar (Slim Utility Bar) */}
      <div className="w-16 flex flex-col items-center py-6 gap-6 border-r bg-card/40">
        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <PanelLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b px-8 flex items-center justify-between bg-card/20 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-bold text-xl tracking-tight text-foreground">Catalyst <span className="text-primary">Canvas</span></h1>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>My Project</span>
              <span className="text-border">/</span>
              <span className="text-foreground">Main Draft</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-secondary/50 border rounded-full px-3 py-1 gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Cloud Sync Active</span>
             </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 flex min-h-0 overflow-hidden p-6 gap-6">
          <div className="flex-1 min-w-0">
            <EditorSurface
              content={content}
              onChange={setContent}
              onSelectionChange={setSelection}
              mode={mode}
              language={language}
              setMode={setMode}
              setLanguage={setLanguage}
              onRefine={handleRefineQuick}
              onDebug={handleDebug}
            />
          </div>
          
          <aside className="w-[400px] flex-shrink-0 flex flex-col h-full rounded-xl overflow-hidden border shadow-xl">
            <PromptConsole 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              history={promptHistory}
            />
          </aside>
        </main>

        {/* Floating AI Output Manager */}
        <AIOutputDisplay 
          output={aiOutput} 
          onAccept={applyAIChange} 
          onReject={() => setAiOutput("")}
          onRefine={handleRefineQuick}
          isApplying={false}
        />
      </div>
      
      <Toaster />
    </div>
  );
}
