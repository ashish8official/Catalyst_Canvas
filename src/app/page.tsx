
"use client";

import React, { useState, useMemo } from "react";
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
  MoreHorizontal,
  Share2,
  Download,
  CheckCircle2,
  Zap,
  Globe,
  Bell,
  Type,
  FileJson,
  Hash
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    content: "SELECT id, name, created_at FROM users WHERE status = 'active' ORDER BY created_at DESC;\n\nSELECT * FROM logs WHERE level = 'ERROR';",
    language: "SQL",
    mode: "code"
  },
  {
    id: "2",
    name: "main.py",
    content: "def greet(name):\n    print(f'Hello, {name}!')\n\nif __name__ == '__main__':\n    greet('World')",
    language: "Python",
    mode: "code"
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
  const [wordWrap, setWordWrap] = useState(true);

  // Dialog State
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Active File Derived State
  const activeFile = useMemo(() => files.find(f => f.id === activeFileId) || files[0], [files, activeFileId]);

  // Document Stats
  const stats = useMemo(() => {
    const text = activeFile.content || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    return { words, chars, lines };
  }, [activeFile.content]);

  const updateActiveFileContent = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const getDetailsFromFileName = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'plsql' || ext === 'sql') return { language: 'SQL', mode: 'code' as const };
    if (ext === 'py') return { language: 'Python', mode: 'code' as const };
    if (ext === 'json') return { language: 'JSON', mode: 'code' as const };
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
    toast({ title: "File Created", description: `Created ${newFile.name}` });
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

  const handleRename = (id: string, nextName: string) => {
    if (nextName && nextName.trim()) {
      const { language, mode } = getDetailsFromFileName(nextName);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: nextName, language, mode } : f));
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
      setPipelineStep(5); 
      setAiOutput(result);
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Generation failed." });
      setPipelineStep(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (promptText: string) => {
    setPromptHistory(prev => [promptText, ...prev]);
    simulatePipeline(async () => {
      if (selection) {
        const res = await refineSelectedText({ selectedText: selection, refinementPrompt: promptText });
        return res.refinedText;
      } else {
        const res = await generateNewContentFromPrompt({ prompt: promptText });
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

  // Search Results Filtering
  const filteredSearchFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <TooltipContent side="right">Search</TooltipContent>
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
              <TooltipContent side="right">Help</TooltipContent>
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
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={handleCreateFile}>
                  <FilePlus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-w-[320px]">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group cursor-pointer",
                      activeFileId === file.id 
                        ? "bg-primary/15 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                    )}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    {file.mode === "code" ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="truncate flex-1 font-medium">{file.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}>
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
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="relative group px-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search project..." 
                    className="pl-10 bg-secondary/30 border-white/5 h-11 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <ScrollArea className="flex-1 px-1">
                  <div className="space-y-2 pr-4 pb-4">
                    {searchQuery.trim() !== "" ? (
                      filteredSearchFiles.length > 0 ? (
                        filteredSearchFiles.map(file => (
                          <div
                            key={file.id}
                            className={cn(
                              "p-3 rounded-xl border transition-all cursor-pointer group",
                              activeFileId === file.id ? "bg-primary/10 border-primary/30" : "bg-secondary/20 border-white/5 hover:border-primary/20 hover:bg-secondary/40"
                            )}
                            onClick={() => setActiveFileId(file.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {file.mode === "code" ? <FileCode className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                              <span className="text-[11px] font-bold text-foreground truncate">{file.name}</span>
                              <Badge variant="outline" className="ml-auto text-[8px] h-4 uppercase tracking-tighter opacity-50 px-1">{file.language}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic opacity-80 font-code">
                              {file.content.substring(0, 80)}...
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 opacity-30">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No matches found</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                        <Search className="w-10 h-10" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] max-w-[150px] leading-loose">Enter search criteria to scan the project.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {sidebarTab === "settings" && (
            <div className="min-w-[320px] h-full flex flex-col">
              <div className="p-4 border-b bg-secondary/20">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preferences</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editor</label>
                  <div className="space-y-2">
                    <div 
                      className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setWordWrap(!wordWrap)}
                    >
                      <span className="text-xs">Word Wrap</span>
                      <div className={cn("w-8 h-4 rounded-full relative transition-colors", wordWrap ? "bg-primary" : "bg-secondary")}>
                        <div className={cn("absolute top-1 w-2 h-2 bg-white rounded-full transition-all", wordWrap ? "right-1" : "left-1")} />
                      </div>
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
                className="h-8 w-8 text-muted-foreground hover:text-primary"
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
            </div>

            {/* Useful Editor Utilities */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 bg-secondary/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                  <Type className="w-3.5 h-3.5 text-primary/60" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Words</span>
                    <span className="text-[11px] font-mono font-bold">{stats.words}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                  <Hash className="w-3.5 h-3.5 text-primary/60" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Chars</span>
                    <span className="text-[11px] font-mono font-bold">{stats.chars}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Lines</span>
                    <span className="text-[11px] font-mono font-bold">{stats.lines}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <Badge variant="outline" className="h-5 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1.5 uppercase font-bold tracking-widest">Gemini 2.5</Badge>
                </div>
              </div>

              {/* Action Utilities */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Workspace</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-[10px] font-bold uppercase tracking-widest border-white/10 rounded-xl hover:bg-secondary transition-all">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-white/10 w-48">
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Download as</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="text-xs gap-2 py-2.5">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      Project Bundle (.zip)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs gap-2 py-2.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Plain Text (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs gap-2 py-2.5">
                      <FileJson className="w-4 h-4 text-amber-400" />
                      JSON Structure
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => toast({ title: "Saved", description: `${activeFile.name} changes committed.` })}
                      className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 rounded-xl shadow-lg shadow-primary/20"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Commit Changes</TooltipContent>
                </Tooltip>
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
                wordWrap={wordWrap}
                onRefine={(p) => p ? handleGenerate(p) : handleFormat()}
                onFormat={handleFormat}
                onSave={() => toast({ title: "Saved", description: `${activeFile.name} has been saved.` })}
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
            onRefine={() => handleGenerate("Refactor this response for better clarity.")}
            isLoading={isLoading}
            step={pipelineStep}
          />
        </div>

        {/* Save As Dialog */}
        <Dialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary font-headline">Clone File</DialogTitle>
              <DialogDescription>Enter a new name for your file.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="filename" className="text-xs font-bold text-muted-foreground uppercase">New Name</Label>
              <Input
                id="filename"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsSaveAsOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAs} className="bg-primary hover:bg-primary/90">Clone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
