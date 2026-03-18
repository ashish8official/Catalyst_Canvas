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
  PanelLeftOpen,
  Terminal,
  Activity,
  Edit2,
  Trash2,
  Save,
  FilePlus,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
    content: "SELECT id, name, created_at FROM users WHERE status = 'active' ORDER BY created_at DESC;\nSELECT * FROM logs WHERE level = 'ERROR';",
    language: "SQL",
    mode: "code"
  },
  {
    id: "2",
    name: "main.py",
    content: "def greet(name):\n  print(f'Hello, {name}!')\n\nif __name__ == '__main__':\n  greet('World')",
    language: "Python",
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

type SidebarTab = "explorer" | "debug" | "search" | "settings";

export default function CatalystCanvas() {
  const { toast } = useToast();
  
  // File System State
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("1");
  
  // UI State
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("explorer");
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [selection, setSelection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [pipelineStep, setPipelineStep] = useState<number>(-1);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Active File Derived State
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const updateActiveFileContent = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const getDetailsFromFileName = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'plsql') return { language: 'PL/SQL', mode: 'code' as const };
    if (ext === 'py') return { language: 'Python', mode: 'code' as const };
    if (ext === 'sql') return { language: 'SQL', mode: 'code' as const };
    return { language: 'Plain Text', mode: 'text' as const };
  };

  const handleCreateFile = () => {
    const newId = Math.random().toString(36).substring(7);
    const name = `untitled-${files.length + 1}.txt`;
    const { language, mode } = getDetailsFromFileName(name);

    const newFile: FileEntry = {
      id: newId,
      name: name,
      content: "",
      language: language,
      mode: mode
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    setSidebarTab("explorer");
    setIsExplorerOpen(true);
    toast({ title: "File Created", description: `Created ${newFile.name} (${language})` });
  };

  const handleDeleteFile = (id: string) => {
    if (files.length === 1) {
      toast({ variant: "destructive", title: "Cannot delete", description: "You must have at least one file open." });
      return;
    }
    const fileToDelete = files.find(f => f.id === id);
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
    toast({ title: "File Deleted", description: `Removed ${fileToDelete?.name}` });
  };

  const handleSaveAs = () => {
    if (!newFileName.trim()) return;
    
    const { language, mode } = getDetailsFromFileName(newFileName);
    const newId = Math.random().toString(36).substring(7);
    
    const newFile: FileEntry = {
      id: newId,
      name: newFileName,
      content: activeFile.content,
      language: language,
      mode: mode
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    setIsSaveAsOpen(false);
    setNewFileName("");
    toast({ title: "File Saved As", description: `Created copy: ${newFileName}` });
  };

  const handleRename = (id: string, nextName?: string) => {
    const targetFile = files.find(f => f.id === id);
    if (!targetFile) return;

    const finalName = typeof nextName === 'string' ? nextName : prompt("Rename file to:", targetFile.name);
    
    if (finalName && finalName.trim() && finalName !== targetFile.name) {
      const { language, mode } = getDetailsFromFileName(finalName);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: finalName, language, mode } : f));
      toast({ title: "File Renamed", description: `Updated to ${finalName}` });
    }
  };

  const simulatePipeline = async (action: () => Promise<string>) => {
    setIsLoading(true);
    setAiOutput("");
    setPipelineStep(0); 
    
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(1); 
    
    await new Promise(r => setTimeout(r, 800));
    setPipelineStep(2); 
    
    try {
      const result = await action();
      
      setPipelineStep(3); 
      await new Promise(r => setTimeout(r, 400));
      
      setPipelineStep(4); 
      await new Promise(r => setTimeout(r, 400));
      
      setAiOutput(result);
      setPipelineStep(5); 
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

  const toggleTab = (tab: SidebarTab) => {
    if (sidebarTab === tab) {
      setIsExplorerOpen(!isExplorerOpen);
    } else {
      setSidebarTab(tab);
      setIsExplorerOpen(true);
    }
  };

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
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "explorer" && isExplorerOpen ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={() => toggleTab("explorer")}
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
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "debug" && isExplorerOpen ? "text-destructive bg-destructive/10" : "text-muted-foreground")}
                  onClick={() => toggleTab("debug")}
                >
                  <Bug className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Diagnostics</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "search" && isExplorerOpen ? "text-blue-400 bg-blue-400/10" : "text-muted-foreground")}
                  onClick={() => toggleTab("search")}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Global Search</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("h-10 w-10 transition-colors", sidebarTab === "settings" && isExplorerOpen ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground")}
                  onClick={() => toggleTab("settings")}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Documentation</TooltipContent>
            </Tooltip>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Panel (Collapsible) */}
        <div 
          className={cn(
            "border-r bg-card/40 flex flex-col explorer-transition overflow-hidden",
            isExplorerOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-none"
          )}
        >
          {sidebarTab === "explorer" && (
            <>
              <div className="p-4 flex items-center justify-between border-b bg-secondary/20 min-w-[320px]">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Explorer</span>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={handleCreateFile}>
                        <FilePlus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New File</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-w-[320px]">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group cursor-pointer",
                      activeFileId === file.id 
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                    )}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    {file.mode === "code" ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="truncate flex-1 text-left font-medium">{file.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" size="icon" className="h-6 w-6 hover:text-primary" 
                        onClick={(e) => { e.stopPropagation(); handleRename(file.id); }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {sidebarTab === "debug" && (
            <div className="min-w-[320px] h-full">
              <DebugPanel 
                content={activeFile.content}
                language={activeFile.language}
                onFixAll={() => handleGenerate("Refactor and fix all issues identified in the diagnostic report.")} 
              />
            </div>
          )}

          {sidebarTab === "search" && (
            <div className="min-w-[320px] h-full flex flex-col">
              <div className="p-4 border-b bg-secondary/20">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Search</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search project files..." 
                    className="pl-10 bg-secondary/30 border-white/5 focus-visible:ring-primary/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Search Results</p>
                  <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                    <Search className="w-10 h-10" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No results found</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === "settings" && (
            <div className="min-w-[320px] h-full flex flex-col">
              <div className="p-4 border-b bg-secondary/20">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Environment Settings</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Engine</label>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Gemini 2.5 Flash</span>
                      <Badge variant="secondary" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ACTIVE</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Optimized for rapid generation and diagnostic accuracy.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editor Preferences</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg cursor-pointer transition-colors">
                      <span className="text-xs">Line Numbers</span>
                      <div className="w-8 h-4 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" /></div>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg cursor-pointer transition-colors">
                      <span className="text-xs">Word Wrap</span>
                      <div className="w-8 h-4 bg-secondary rounded-full relative"><div className="absolute left-1 top-1 w-2 h-2 bg-white/40 rounded-full" /></div>
                    </div>
                  </div>
                </div>
              </div>
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
              <div 
                className="flex items-center gap-2 bg-secondary/40 px-3 py-1 rounded-full border border-white/5 cursor-pointer hover:bg-secondary/60 transition-colors"
                onClick={() => handleRename(activeFile.id)}
              >
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
                onSave={() => toast({ title: "File Saved", description: `Successfully committed ${activeFile.name}` })}
                onSaveAs={() => { setNewFileName(`${activeFile.name.split('.')[0]}-copy.${activeFile.name.split('.').pop()}`); setIsSaveAsOpen(true); }}
                onRename={(newName) => handleRename(activeFile.id, newName)}
                onDelete={() => handleDeleteFile(activeFile.id)}
                onNewFile={handleCreateFile}
              />
            </div>
            
            <aside className="hidden xl:flex w-[400px] flex-shrink-0 flex flex-col h-full rounded-2xl overflow-hidden border bg-card/40 shadow-2xl backdrop-blur-sm">
              <PromptConsole 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
                history={promptHistory}
                onNewFile={handleCreateFile}
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

        {/* Save As Dialog */}
        <Dialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary font-headline">Save As / Clone File</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a new name for your file. Language mode will be detected automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right text-xs uppercase font-bold text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="filename"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="col-span-3 bg-secondary/30 border-white/10"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsSaveAsOpen(false)} className="text-xs uppercase font-bold">Cancel</Button>
              <Button onClick={handleSaveAs} className="bg-primary hover:bg-primary/90 text-xs uppercase font-bold px-6">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
