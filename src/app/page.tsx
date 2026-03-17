
"use client";

import React, { useState, useEffect } from "react";
import { EditorSurface } from "@/components/editor/EditorSurface";
import { PromptConsole } from "@/components/ai/PromptConsole";
import { AIOutputDisplay } from "@/components/ai/AIOutputDisplay";
import { generateNewContentFromPrompt } from "@/ai/flows/generate-new-content-from-prompt";
import { refineSelectedText } from "@/ai/flows/refine-selected-text-flow";
import { explainOrFixSelectedCode } from "@/ai/flows/explain-or-fix-selected-code";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Cpu, 
  Settings, 
  UserCircle, 
  Search, 
  HelpCircle, 
  Plus, 
  FileCode, 
  FileText, 
  FolderOpen,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileEntry {
  id: string;
  name: string;
  content: string;
  language: string;
  mode: "text" | "code";
}

const INITIAL_FILES: FileEntry[] = [
  {
    id: "1",
    name: "main.ts",
    content: "// Welcome to Catalyst Canvas\n// The context-aware intelligent workspace.\n\nfunction helloWorld() {\n  console.log(\"Start creating with AI power...\");\n}",
    language: "TypeScript",
    mode: "code"
  },
  {
    id: "2",
    name: "README.md",
    content: "# Project Catalyst\n\nThis is your intelligent workspace where AI helps you write and code better.",
    language: "Markdown",
    mode: "text"
  }
];

export default function CatalystCanvas() {
  const { toast } = useToast();
  
  // File System State
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("1");
  
  // Active File Derived State
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  
  // Editor/AI State
  const [selection, setSelection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const updateActiveFileContent = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const handleCreateFile = () => {
    const newId = Math.random().toString(36).substring(7);
    const newFile: FileEntry = {
      id: newId,
      name: `new-file-${files.length + 1}.ts`,
      content: "",
      language: "TypeScript",
      mode: "code"
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    toast({
      title: "File Created",
      description: `Created ${newFile.name}`
    });
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length === 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setPromptHistory(prev => [prompt, ...prev]);
    try {
      if (selection) {
        const result = await refineSelectedText({
          selectedText: selection,
          refinementPrompt: prompt
        });
        setAiOutput(result.refinedText);
      } else {
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
        language: activeFile.language.toLowerCase()
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

  const applyAIChange = () => {
    if (selection) {
      updateActiveFileContent(activeFile.content.replace(selection, aiOutput));
    } else {
      updateActiveFileContent(activeFile.content + "\n\n" + aiOutput);
    }
    setAiOutput("");
    setSelection("");
    toast({
      title: "Content Updated",
      description: "AI suggestion has been successfully integrated."
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* App Sidebar */}
      <div className="w-16 flex flex-col items-center py-6 gap-6 border-r bg-card/60 backdrop-blur-sm z-20">
        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/10">
          <Cpu className="w-6 h-6 text-background" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <FolderOpen className="w-5 h-5" />
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
          <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Explorer Sidebar */}
      <div className="w-64 border-r bg-card/30 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Explorer</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFile}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all group",
                activeFileId === file.id 
                  ? "bg-accent text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {file.mode === "code" ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="truncate flex-1 text-left">{file.name}</span>
              {files.length > 1 && (
                <X 
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity" 
                  onClick={(e) => handleDeleteFile(e, file.id)}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b px-8 flex items-center justify-between bg-card/10 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-bold text-xl tracking-tight">
              Catalyst<span className="text-muted-foreground/50">.</span>Canvas
            </h1>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="bg-accent/50 px-2 py-0.5 rounded border border-border">{activeFile.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-accent/30 border border-white/5 rounded-full px-3 py-1 gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Workspace Sync</span>
             </div>
          </div>
        </header>

        <main className="flex-1 flex min-h-0 overflow-hidden p-6 gap-6">
          <div className="flex-1 min-w-0">
            <EditorSurface
              fileName={activeFile.name}
              content={activeFile.content}
              onChange={updateActiveFileContent}
              onSelectionChange={setSelection}
              mode={activeFile.mode}
              language={activeFile.language}
              onRefine={() => handleGenerate("Refine and improve this content while maintaining context.")}
              onDebug={handleDebug}
            />
          </div>
          
          <aside className="w-[400px] flex-shrink-0 flex flex-col h-full rounded-2xl overflow-hidden border bg-card/20 shadow-2xl">
            <PromptConsole 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              history={promptHistory}
            />
          </aside>
        </main>

        <AIOutputDisplay 
          output={aiOutput} 
          onAccept={applyAIChange} 
          onReject={() => setAiOutput("")}
          onRefine={() => handleGenerate("Make this suggestion better.")}
          isApplying={false}
        />
      </div>
      
      <Toaster />
    </div>
  );
}
