"use client";

import React, { useState, useEffect } from "react";
import { EditorSurface } from "@/components/editor/EditorSurface";
import { PromptConsole } from "@/components/ai/PromptConsole";
import { AIOutputDisplay } from "@/components/ai/AIOutputDisplay";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { generateNewContentFromPrompt } from "@/ai/flows/generate-new-content-from-prompt";
import { refineSelectedText } from "@/ai/flows/refine-selected-text-flow";
import { formatContent } from "@/ai/flows/format-content-flow";
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
  X,
  Layers,
  Bug,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    name: "query.sql",
    content: "select id, name, created_at from users where status = 'active' order by created_at desc;",
    language: "SQL",
    mode: "code"
  },
  {
    id: "2",
    name: "process.plsql",
    content: "create or replace procedure update_user_status (p_user_id in number, p_status in varchar2) as begin update users set status = p_status where id = p_user_id; commit; end;",
    language: "PL/SQL",
    mode: "code"
  },
  {
    id: "3",
    name: "notes.txt",
    content: "todo: optimize the user status update procedure. add logging. validate input parameters.",
    language: "Plain Text",
    mode: "text"
  }
];

export default function CatalystCanvas() {
  const { toast } = useToast();
  
  // File System State
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("1");
  
  // UI State
  const [sidebarTab, setSidebarTab] = useState<"explorer" | "debug">("explorer");
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [selection, setSelection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [pipelineStep, setPipelineStep] = useState<number>(-1);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // Active File Derived State
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const updateActiveFileContent = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const handleCreateFile = () => {
    const newId = Math.random().toString(36).substring(7);
    const name = `new-file-${files.length + 1}.sql`;
    const ext = `.${name.split('.').pop()}`;
    const language = ext === '.plsql' ? 'PL/SQL' : ext === '.txt' ? 'Plain Text' : 'SQL';
    const mode: "text" | "code" = ext === '.txt' ? 'text' : 'code';

    const newFile: FileEntry = {
      id: newId,
      name: name,
      content: "",
      language: language,
      mode: mode
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    setIsExplorerOpen(true);
    toast({ title: "File Created", description: `Created ${newFile.name}` });
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length === 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const simulatePipeline = async (action: () => Promise<string>) => {
    setIsLoading(true);
    setAiOutput("");
    setPipelineStep(0); // Context inject
    
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(1); // Template expand
    
    await new Promise(r => setTimeout(r, 800));
    setPipelineStep(2); // LLM call
    
    try {
      const result = await action();
      
      setPipelineStep(3); // Normalize
      await new Promise(r => setTimeout(r, 400));
      
      setPipelineStep(4); // Diff gen
      await new Promise(r => setTimeout(r, 400));
      
      setAiOutput(result);
      setPipelineStep(5); // Complete
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Generation failed." });
      setPipelineStep(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (prompt: string) => {
    setPromptHistory(prev => [prompt, ...prev]);
    simulatePipeline(async () => {
      if (selection) {
        const res = await refineSelectedText({ selectedText: selection, refinementPrompt: prompt });
        return res.refinedText;
      } else {
        const res = await generateNewContentFromPrompt({ prompt });
        return res.generatedContent;
      }
    });
  };

  const handleFormat = () => {
    simulatePipeline(async () => {
      const targetContent = selection || activeFile.content;
      const res = await formatContent({ 
        content: targetContent, 
        language: activeFile.language, 
        mode: activeFile.mode 
      });
      return res.formattedContent;
    });
  };

  const applyAIChange = () => {
    if (selection) {
      updateActiveFileContent(activeFile.content.replace(selection, aiOutput));
    } else {
      updateActiveFileContent(aiOutput);
    }
    setAiOutput("");
    setSelection("");
    setPipelineStep(-1);
  };

  // Auto-detect language when active file changes
useEffect(() => {
  const file = files.find(f => f.id === activeFileId);
  if (!file) return;

  const name = file.name.toLowerCase();
  let detectedLanguage = file.language;
  let detectedMode: "text" | "code" = file.mode;

  if (name.endsWith('.sql')) {
    detectedLanguage = 'SQL'; detectedMode = 'code';
  } else if (name.endsWith('.plsql') || name.endsWith('.pls') || name.endsWith('.pks')) {
    detectedLanguage = 'PL/SQL'; detectedMode = 'code';
  } else if (name.endsWith('.txt') || name.endsWith('.md')) {
    detectedLanguage = 'Plain Text'; detectedMode = 'text';
  } else if (name.endsWith('.js') || name.endsWith('.ts')) {
    detectedLanguage = 'JavaScript'; detectedMode = 'code';
  }

  // Only update if changed to avoid re-render loop
  if (detectedLanguage !== file.language || detectedMode !== file.mode) {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, language: detectedLanguage, mode: detectedMode }
        : f
    ));
  }
}, [activeFileId, files.find(f => f.id === activeFileId)?.name]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {/* App Sidebar (Fixed Icon Bar) */}
        <div className="w-16 flex flex-col items-center py-6 gap-6 border-r bg-card/60 backdrop-blur-md z-30">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Cpu className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "explorer" ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={() => {
                    if (sidebarTab === "explorer") setIsExplorerOpen(!isExplorerOpen);
                    setSidebarTab("explorer");
                  }}
                >
                  <FolderOpen className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Explorer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "debug" ? "text-destructive bg-destructive/10" : "text-muted-foreground")}
                  onClick={() => {
                    if (sidebarTab === "debug") setIsExplorerOpen(!isExplorerOpen);
                    setSidebarTab("debug");
                  }}
                >
                  <Bug className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Diagnostics</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                  <Search className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Explorer/Debug Sidebar Panel (Collapsible) */}
        <div 
          className={cn(
            "border-r bg-card/40 flex flex-col explorer-transition overflow-hidden",
            isExplorerOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-none"
          )}
        >
          {sidebarTab === "explorer" ? (
            <>
              <div className="p-4 flex items-center justify-between border-b bg-secondary/20 min-w-[320px]">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Explorer</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFile}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-w-[320px]">
                {files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                      activeFileId === file.id 
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                    )}
                  >
                    {file.mode === "code" ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="truncate flex-1 text-left">{file.name}</span>
                    {files.length > 1 && (
                      <X 
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity" 
                        onClick={(e) => handleDeleteFile(e, file.id)}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="min-w-[320px] h-full">
              <DebugPanel 
                content={activeFile.content}
                language={activeFile.language}
                onFixAll={() => handleGenerate("Refactor and fix all issues identified in the diagnostic report.")} 
              />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <header className="h-16 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsExplorerOpen(!isExplorerOpen)}
              >
                {isExplorerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h1 className="font-headline font-bold text-lg tracking-tight text-primary">
                  Catalyst<span className="text-foreground">.</span>Canvas
                </h1>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 bg-secondary/40 px-3 py-1 rounded-full border border-white/5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">File:</span>
                <span className="text-[10px] font-semibold text-primary/80 truncate max-w-[200px]">{activeFile.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Workspace</span>
               </div>
            </div>
          </header>

          <main className="flex-1 flex min-h-0 overflow-hidden p-4 lg:p-6 gap-6">
            <div className="flex-1 min-w-0">
              <EditorSurface
                fileName={activeFile.name}
                content={activeFile.content}
                onChange={updateActiveFileContent}
                onSelectionChange={setSelection}
                mode={activeFile.mode}
                language={activeFile.language}
                onRefine={(p) => p ? handleGenerate(p) : handleFormat()}
                onFormat={handleFormat}
              />
            </div>
            
            <aside className="hidden xl:flex w-[400px] flex-shrink-0 flex flex-col h-full rounded-2xl overflow-hidden border bg-card/40 shadow-2xl backdrop-blur-sm">
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
            onReject={() => { setAiOutput(""); setPipelineStep(-1); }}
            onRefine={() => handleGenerate("Iterate on this suggestion for better clarity.")}
            isLoading={isLoading}
            step={pipelineStep}
          />
        </div>
        
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
