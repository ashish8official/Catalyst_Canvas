
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { EditorSurface } from "@/components/editor/EditorSurface";
import { PromptConsole } from "@/components/ai/PromptConsole";
import { AIOutputDisplay } from "@/components/ai/AIOutputDisplay";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { generateNewContentFromPrompt } from "@/ai/flows/generate-new-content-from-prompt";
import { refineSelectedText } from "@/ai/flows/refine-selected-text-flow";
import { formatContent } from "@/ai/flows/format-content-flow";
import { explainOrFixSelectedCode } from "@/ai/flows/explain-or-fix-selected-code";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Cpu, 
  Settings, 
  UserCircle, 
  Search, 
  HelpCircle, 
  FolderOpen,
  Bug,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Trash2,
  Save,
  FilePlus,
  Share2,
  Download,
  Zap,
  Layers,
  Type,
  Hash,
  FileCode,
  FileText,
  FileJson
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

  // Language Detection Logic
  const detectLanguage = (name: string, content: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    
    // 1. Extension Check
    if (ext === 'sql') return { language: 'SQL', mode: 'code' as const };
    if (ext === 'plsql') return { language: 'PL/SQL', mode: 'code' as const };
    if (ext === 'py') return { language: 'Python', mode: 'code' as const };
    if (ext === 'md') return { language: 'Markdown', mode: 'text' as const };
    if (ext === 'json') return { language: 'JSON', mode: 'code' as const };
    if (ext === 'txt') return { language: 'Plain Text', mode: 'text' as const };

    // 2. Content Sniffing (Fallback)
    const snippet = content.substring(0, 500).toUpperCase();
    const sqlKeywords = ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE ', 'DROP ', 'ALTER ', 'TABLE '];
    const plsqlKeywords = ['DECLARE', 'BEGIN', 'EXCEPTION', 'PROCEDURE ', 'FUNCTION '];

    if (plsqlKeywords.some(kw => snippet.includes(kw))) return { language: 'PL/SQL', mode: 'code' as const };
    if (sqlKeywords.some(kw => snippet.includes(kw))) return { language: 'SQL', mode: 'code' as const };
    if (snippet.includes('DEF ') || snippet.includes('IMPORT ')) return { language: 'Python', mode: 'code' as const };

    return { language: 'Plain Text', mode: 'text' as const };
  };

  // Document Stats
  const stats = useMemo(() => {
    const text = activeFile.content || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    return { words, chars, lines };
  }, [activeFile.content]);

  const updateActiveFileContent = (newContent: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === activeFileId) {
        const { language, mode } = detectLanguage(f.name, newContent);
        return { ...f, content: newContent, language, mode };
      }
      return f;
    }));
  };

  const handleCreateFile = () => {
    const newId = Math.random().toString(36).substring(7);
    const name = `untitled-${files.length + 1}.txt`;
    const { language, mode } = detectLanguage(name, "");

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
    const { language, mode } = detectLanguage(newFileName, activeFile.content);
    const newId = Math.random().toString(36).substring(7);
    const newFile: FileEntry = { id: newId, name: newFileName, content: activeFile.content, language, mode };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    setIsSaveAsOpen(false);
    setNewFileName("");
    toast({ title: "File Saved As", description: `Created copy: ${newFileName}` });
  };

  const handleRename = (id: string, nextName: string) => {
    if (nextName && nextName.trim()) {
      const file = files.find(f => f.id === id);
      const { language, mode } = detectLanguage(nextName, file?.content || "");
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: nextName, language, mode } : f));
    }
  };

  const simulatePipeline = async (action: () => Promise<string>) => {
    setIsLoading(true);
    setAiOutput("");
    setPipelineStep(0); 
    await new Promise(r => setTimeout(r, 600));
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

  const handleGenerate = (promptText: string, context?: string[]) => {
    setPromptHistory(prev => [promptText, ...prev]);
    simulatePipeline(async () => {
      const isSelectionOnly = context?.includes("Selection Only");
      const targetText = isSelectionOnly ? selection : activeFile.content;
      
      if (isSelectionOnly && !selection) {
        throw new Error("No text selected for refinement.");
      }

      if (selection || isSelectionOnly) {
        const res = await refineSelectedText({ selectedText: targetText || selection, refinementPrompt: promptText });
        return res.refinedText;
      } else {
        const res = await generateNewContentFromPrompt({ prompt: promptText });
        return res.generatedContent;
      }
    });
  };

  const handleAIAction = (action: 'explain' | 'fix' | 'format') => {
    if (action === 'format') {
      simulatePipeline(async () => {
        const targetContent = selection || activeFile.content;
        const res = await formatContent({ content: targetContent, language: activeFile.language, mode: activeFile.mode });
        return res.formattedContent;
      });
    } else {
      simulatePipeline(async () => {
        const res = await explainOrFixSelectedCode({
          codeSnippet: selection || activeFile.content,
          action: action === 'explain' ? 'explain' : 'fix_or_improve',
          language: activeFile.language
        });
        return res.explanationOrFix;
      });
    }
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

  const filteredSearchFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {/* App Sidebar (Icon Bar) */}
        <div className="w-16 flex flex-col items-center py-6 gap-6 border-r bg-card/60 backdrop-blur-md z-30">
          <div className="p-2 bg-[#B478EA] rounded-xl shadow-lg shadow-[#B478EA]/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-10 w-10 transition-colors", sidebarTab === "explorer" && isExplorerOpen ? "text-[#B478EA] bg-[#B478EA]/10" : "text-muted-foreground")} onClick={() => toggleTab("explorer")}><FolderOpen className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent side="right">Explorer</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-10 w-10 transition-colors", sidebarTab === "debug" && isExplorerOpen ? "text-destructive bg-destructive/10" : "text-muted-foreground")} onClick={() => toggleTab("debug")}><Bug className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent side="right">Diagnostics</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-10 w-10 transition-colors", sidebarTab === "search" && isExplorerOpen ? "text-blue-400 bg-blue-400/10" : "text-muted-foreground")} onClick={() => toggleTab("search")}><Search className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-10 w-10 transition-colors", sidebarTab === "settings" && isExplorerOpen ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground")} onClick={() => toggleTab("settings")}><Settings className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><HelpCircle className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent side="right">Help</TooltipContent>
            </Tooltip>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Panel */}
        <div className={cn("border-r bg-card/40 flex flex-col explorer-transition overflow-hidden", isExplorerOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-none")}>
          {sidebarTab === "explorer" && (
            <>
              <div className="p-4 flex items-center justify-between border-b bg-secondary/20 min-w-[320px]">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={handleCreateFile}><FilePlus className="w-4 h-4" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-w-[320px]">
                {files.map(file => (
                  <div key={file.id} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group cursor-pointer", activeFileId === file.id ? "bg-[#B478EA]/15 text-[#B478EA] border border-[#B478EA]/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent")} onClick={() => setActiveFileId(file.id)}>
                    {file.mode === "code" ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="truncate flex-1 font-medium">{file.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
              </div>
            </>
          )}
          {sidebarTab === "debug" && (
            <div className="min-w-[320px] h-full"><DebugPanel content={activeFile.content} language={activeFile.language} onFixAll={() => handleAIAction('fix')} /></div>
          )}
          {sidebarTab === "search" && (
            <div className="min-w-[320px] h-full flex flex-col p-4 gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</span>
              <Input placeholder="Search project..." className="bg-secondary/30 border-white/5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredSearchFiles.map(file => (
                    <div key={file.id} className="p-3 rounded-lg border border-white/5 hover:border-[#B478EA]/30 bg-secondary/10 cursor-pointer" onClick={() => setActiveFileId(file.id)}>
                      <div className="text-[10px] font-bold text-foreground mb-1">{file.name}</div>
                      <div className="text-[9px] text-muted-foreground line-clamp-2 italic">{file.content.substring(0, 100)}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          {sidebarTab === "settings" && (
            <div className="min-w-[320px] p-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Settings</span>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Word Wrap</Label>
                  <Button variant={wordWrap ? "default" : "outline"} size="sm" onClick={() => setWordWrap(!wordWrap)} className="h-7 text-[10px]">
                    {wordWrap ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <header className="h-16 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsExplorerOpen(!isExplorerOpen)}>
                {isExplorerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#B478EA]" />
                <h1 className="font-headline font-bold text-lg tracking-tight text-[#B478EA]">Catalyst<span className="text-foreground">.</span>Canvas</h1>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 bg-secondary/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                  <Type className="w-3.5 h-3.5 text-primary/60" />
                  <div className="flex flex-col"><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Words</span><span className="text-[11px] font-mono font-bold">{stats.words}</span></div>
                </div>
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                  <Hash className="w-3.5 h-3.5 text-primary/60" />
                  <div className="flex flex-col"><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Chars</span><span className="text-[11px] font-mono font-bold">{stats.chars}</span></div>
                </div>
                <div className="flex items-center gap-3"><Zap className="w-3.5 h-3.5 text-amber-400" /><Badge variant="outline" className="h-5 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1.5 uppercase font-bold tracking-widest">Gemini 2.5</Badge></div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl"><Share2 className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Share</TooltipContent></Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-9 gap-2 text-[10px] font-bold uppercase tracking-widest border-white/10 rounded-xl hover:bg-secondary"><Download className="w-3.5 h-3.5" />Export</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-white/10 w-48"><DropdownMenuItem className="text-xs gap-2 py-2.5"><FileCode className="w-4 h-4 text-blue-400" />Project (.zip)</DropdownMenuItem><DropdownMenuItem className="text-xs gap-2 py-2.5"><FileText className="w-4 h-4 text-emerald-400" />Text (.txt)</DropdownMenuItem><DropdownMenuItem className="text-xs gap-2 py-2.5"><FileJson className="w-4 h-4 text-amber-400" />JSON Structure</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => toast({ title: "Saved", description: `${activeFile.name} changes committed.` })} className="h-9 gap-2 bg-[#B478EA] hover:bg-[#B478EA]/90 text-white text-[10px] font-bold uppercase tracking-widest px-4 rounded-xl shadow-lg shadow-[#B478EA]/20"><Save className="w-4 h-4" />Save</Button>
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
                onRefine={(p) => p ? handleGenerate(p) : handleAIAction('format')}
                onFormat={() => handleAIAction('format')}
                onSave={() => toast({ title: "Saved", description: `${activeFile.name} saved.` })}
                onSaveAs={() => { setNewFileName(`${activeFile.name.split('.')[0]}-copy.${activeFile.name.split('.').pop()}`); setIsSaveAsOpen(true); }}
                onRename={(newName) => handleRename(activeFile.id, newName)}
                onDelete={() => handleDeleteFile(activeFile.id)}
                onNewFile={handleCreateFile}
              />
            </div>
            
            <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex flex-col h-full rounded-2xl overflow-hidden border bg-card/40 shadow-2xl backdrop-blur-sm">
              <PromptConsole 
                onGenerate={handleGenerate} 
                onAction={handleAIAction}
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
            onRefine={() => handleGenerate("Refine this response for better quality.")}
            isLoading={isLoading}
            step={pipelineStep}
          />
        </div>

        <Dialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader><DialogTitle className="text-primary font-headline">Clone File</DialogTitle><DialogDescription>Enter a new name.</DialogDescription></DialogHeader>
            <div className="py-4"><Label className="text-xs font-bold text-muted-foreground uppercase">New Name</Label><Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} className="mt-2" autoFocus /></div>
            <DialogFooter><Button variant="ghost" onClick={() => setIsSaveAsOpen(false)}>Cancel</Button><Button onClick={handleSaveAs} className="bg-primary hover:bg-primary/90">Clone</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
