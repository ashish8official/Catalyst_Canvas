'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EditorSurface } from '@/components/editor/EditorSurface';
import { PromptConsole } from '@/components/ai/PromptConsole';
import { AIOutputDisplay } from '@/components/ai/AIOutputDisplay';
import { generateNewContentFromPrompt } from '@/ai/flows/generate-new-content-from-prompt';
import { refineSelectedText } from '@/ai/flows/refine-selected-text-flow';
import { formatContent } from '@/ai/flows/format-content-flow';
import { explainOrFixSelectedCode } from '@/ai/flows/explain-or-fix-selected-code';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  Cpu, 
  Settings, 
  UserCircle, 
  Search, 
  FolderOpen,
  Bug,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  SearchCode,
  Globe,
  Save,
  Share2,
  FileDown,
  Plus,
  X,
  FileCode,
  FileText,
  Palette,
  Type as TypeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface FileEntry {
  id: string;
  name: string;
  content: string;
  language: string;
  mode: 'text' | 'code';
}

const INITIAL_FILES: FileEntry[] = [
  {
    id: '1',
    name: 'query.sql',
    content: "SELECT id, name, created_at FROM users WHERE status = 'active' ORDER BY created_at DESC;\n\nSELECT * FROM logs WHERE level = 'ERROR';",
    language: 'SQL',
    mode: 'code'
  },
  {
    id: '2',
    name: 'main.py',
    content: "def greet(name):\n    print(f'Hello, {name}!')\n\nif __name__ == '__main__':\n    greet('World')",
    language: 'Python',
    mode: 'code'
  }
];

export default function CatalystCanvas() {
  const { toast } = useToast();
  
  // AI Panel Persistence
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('cc-ai-panel-open');
    if (saved !== null) setIsAiPanelOpen(saved === 'true');
  }, []);

  const toggleAiPanel = () => {
    const newState = !isAiPanelOpen;
    setIsAiPanelOpen(newState);
    localStorage.setItem('cc-ai-panel-open', String(newState));
  };

  // Editor Settings State
  const [editorSettings, setEditorSettings] = useState({
    textColor: '#E8ECF5',
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
  });

  useEffect(() => {
    const saved = localStorage.getItem('cc-editor-settings');
    if (saved) setEditorSettings(JSON.parse(saved));
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...editorSettings, [key]: value };
    setEditorSettings(newSettings);
    localStorage.setItem('cc-editor-settings', JSON.stringify(newSettings));
  };

  // Global Workspace State
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'debug' | 'search' | 'settings'>('explorer');
  const [selection, setSelection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [pipelineStep, setPipelineStep] = useState<number>(-1);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [activeContextChips, setActiveContextChips] = useState<string[]>(['FULL DOC']);
  const [generationContext, setGenerationContext] = useState<{ text: string; isSelection: boolean; fileId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editorStats, setEditorStats] = useState({ 
    words: 0, 
    chars: 0, 
    lines: 0, 
    ln: 1, 
    col: 1 
  });

  const activeFile = useMemo(() => 
    files.find(f => f.id === activeFileId) || files[0], 
    [files, activeFileId]
  );

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return files.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.content.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  const handleCreateFile = () => {
    const newId = Math.random().toString(36).substring(7);
    const newFile: FileEntry = {
      id: newId,
      name: `untitled-${files.length + 1}.txt`,
      content: '',
      language: 'Plain Text',
      mode: 'text'
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
    setSidebarTab('explorer');
  };

  const handleUpdateFile = (id: string, updates: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const simulatePipeline = async (action: () => Promise<string>) => {
    setIsLoading(true);
    setAiOutput('');
    setPipelineStep(0);
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(1);
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(2);
    
    try {
      const result = await action();
      setPipelineStep(3);
      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(4);
      setAiOutput(result);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Error', description: error.message || 'Generation failed.' });
      setPipelineStep(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (promptText: string) => {
    setPromptHistory(prev => [promptText, ...prev]);
    const useSelection = activeContextChips.includes('SELECTION ONLY');
    const targetText = useSelection ? selection : activeFile.content;

    if (useSelection && !selection) {
      toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select text to refine.' });
      return;
    }

    setGenerationContext({ text: targetText, isSelection: useSelection, fileId: activeFile.id });

    simulatePipeline(async () => {
      if (useSelection) {
        const res = await refineSelectedText({ selectedText: targetText, refinementPrompt: promptText });
        return res.refinedText;
      } else {
        const res = await generateNewContentFromPrompt({ prompt: promptText });
        return res.generatedContent;
      }
    });
  };

  const handleAIAction = (action: 'explain' | 'fix' | 'format' | 'optimize' | 'summarize') => {
    const useSelection = !!selection;
    const targetText = useSelection ? selection : activeFile.content;
    setGenerationContext({ text: targetText, isSelection: useSelection, fileId: activeFile.id });

    if (action === 'format') {
      simulatePipeline(async () => {
        const res = await formatContent({ 
          content: targetText, 
          language: activeFile.language, 
          mode: activeFile.mode 
        });
        return res.formattedContent;
      });
    } else {
      simulatePipeline(async () => {
        const actionMap = {
          explain: 'explain',
          fix: 'fix_or_improve',
          optimize: 'fix_or_improve',
          summarize: 'explain'
        } as const;
        const res = await explainOrFixSelectedCode({
          codeSnippet: targetText,
          action: actionMap[action] || 'explain',
          language: activeFile.language
        });
        return res.explanationOrFix;
      });
    }
  };

  const applyAIChange = () => {
    if (!aiOutput || isLoading) return;

    const targetFileId = generationContext?.fileId || activeFileId;
    const targetFile = files.find(f => f.id === targetFileId);

    if (!targetFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Target file not found.' });
      return;
    }

    if (generationContext?.isSelection && generationContext.text) {
      const newContent = targetFile.content.replace(generationContext.text, aiOutput);
      handleUpdateFile(targetFileId, { content: newContent });
    } else {
      handleUpdateFile(targetFileId, { content: aiOutput });
    }

    setAiOutput('');
    setPipelineStep(-1);
    setGenerationContext(null);
    toast({ title: 'Implementation Merged', description: 'AI changes applied successfully.' });
  };

  const handleExport = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "File Exported",
      description: `${activeFile.name} has been downloaded.`,
    });
  };

  const handleSave = () => {
    toast({
      title: "Workspace Saved",
      description: "All changes have been synced locally.",
    });
  };

  const colorProfiles = [
    { name: 'Catalyst White', value: '#E8ECF5' },
    { name: 'Intelligent Blue', value: '#4775D1' },
    { name: 'Emerald', value: '#34D399' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Signature Purple', value: '#B478EA' },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#15181D] text-[#E8ECF5]">
        {/* Main Sidebar */}
        <div className="w-16 flex flex-col items-center py-6 gap-6 border-r border-[#2A3149] bg-[#1C2028] z-30">
          <div className="p-2 bg-[#B478EA] rounded-xl shadow-lg shadow-[#B478EA]/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'explorer' && "text-[#4775D1] bg-[#4775D1]/10")} onClick={() => setSidebarTab('explorer')}><FolderOpen className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'debug' && "text-[#F87171] bg-[#F87171]/10")} onClick={() => setSidebarTab('debug')}><Bug className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'search' && "text-[#4775D1] bg-[#4775D1]/10")} onClick={() => setSidebarTab('search')}><Search className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'settings' && "text-[#4775D1] bg-[#4775D1]/10")} onClick={() => setSidebarTab('settings')}><Settings className="w-5 h-5" /></Button>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#222837] border border-[#2A3149] flex items-center justify-center cursor-pointer hover:bg-[#2A3149] transition-colors">
            <UserCircle className="w-6 h-6 text-[#8B93B0]" />
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Global Header */}
          <header className="h-16 border-b border-[#2A3149] px-6 flex items-center justify-between bg-[#1C2028]/80 backdrop-blur-md z-20 sticky top-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B478EA]" />
                <h1 className="font-headline font-bold text-lg tracking-tight">Catalyst<span className="text-[#B478EA]">.</span>Canvas</h1>
              </div>

              <div className="hidden lg:flex items-center gap-6 text-[11px] font-mono text-[#4A5178] uppercase font-bold bg-[#15181D]/50 px-4 py-2 rounded-xl border border-[#2A3149]">
                <div className="flex gap-2 items-center">
                  <span className="text-[#8B93B0]">Words</span>
                  <span className="text-[#E8ECF5]">{editorStats.words}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[#8B93B0]">Chars</span>
                  <span className="text-[#E8ECF5]">{editorStats.chars}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[#8B93B0]">Lines</span>
                  <span className="text-[#E8ECF5]">{editorStats.lines}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#222837] rounded-lg border border-[#2A3149]">
                <Badge variant="outline" className="text-[9px] border-[#B478EA]/40 text-[#B478EA] uppercase px-1.5 h-5">Gemini 2.5</Badge>
              </div>
              
              <div className="flex items-center gap-1 p-1 bg-[#222837] rounded-xl border border-[#2A3149]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold uppercase text-[#8B93B0] hover:text-[#4775D1]"
                  onClick={handleExport}
                >
                  <Share2 className="w-3.5 h-3.5 mr-2" /> Export
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 bg-[#4775D1] hover:bg-[#4775D1]/90 text-white text-[10px] font-bold uppercase px-4 rounded-lg shadow-lg shadow-[#4775D1]/10"
                  onClick={handleSave}
                >
                  <Save className="w-3.5 h-3.5 mr-2" /> Save
                </Button>
              </div>

              <div className="w-px h-6 bg-[#2A3149]" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-10 w-10 rounded-xl transition-all", isAiPanelOpen ? "text-[#4775D1] bg-[#4775D1]/10 border-[#4775D1]/20" : "text-[#8B93B0]")}
                    onClick={toggleAiPanel}
                  >
                    {isAiPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle AI Panel</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Editor & AI Console */}
          <main className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Left: Sidebar Content */}
            <div className={cn("border-r border-[#2A3149] bg-[#1C2028]/40 transition-all overflow-hidden", sidebarTab === 'debug' ? 'w-80' : 'w-64')}>
              <ScrollArea className="h-full">
                {sidebarTab === 'explorer' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5178]">Explorer</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-[#4A5178] hover:text-[#4775D1]" onClick={handleCreateFile}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {files.map(f => (
                        <div 
                          key={f.id}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm flex items-center justify-between group cursor-pointer transition-colors",
                            activeFileId === f.id ? "bg-[#4775D1]/10 text-[#4775D1]" : "text-[#8B93B0] hover:bg-[#222837]"
                          )}
                          onClick={() => setActiveFileId(f.id)}
                        >
                          <div className="flex items-center gap-3 truncate">
                            {f.mode === 'code' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            <span className="truncate">{f.name}</span>
                          </div>
                          {files.length > 1 && (
                            <X className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:text-[#F87171] transition-opacity" onClick={(e) => {
                              e.stopPropagation();
                              setFiles(prev => prev.filter(x => x.id !== f.id));
                              if (activeFileId === f.id) setActiveFileId(files.find(x => x.id !== f.id)?.id || '');
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sidebarTab === 'debug' && (
                  <DebugPanel 
                    content={activeFile.content} 
                    language={activeFile.language} 
                    onFixAll={() => handleAIAction('fix')} 
                  />
                )}
                {sidebarTab === 'search' && (
                  <div className="p-4 space-y-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5178]">Search Project</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5178]" />
                      <Input 
                        placeholder="Search files and content..." 
                        className="pl-10 bg-[#15181D] border-[#2A3149] text-sm focus:ring-[#4775D1]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      {filteredSearchResults.length > 0 ? (
                        filteredSearchResults.map(f => (
                          <div 
                            key={f.id}
                            className="p-3 bg-[#15181D]/50 border border-[#2A3149] rounded-xl cursor-pointer hover:border-[#4775D1]/40 transition-all group"
                            onClick={() => { setActiveFileId(f.id); setSearchQuery(''); }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {f.mode === 'code' ? <FileCode className="w-3.5 h-3.5 text-[#4775D1]" /> : <FileText className="w-3.5 h-3.5 text-[#8B93B0]" />}
                              <span className="text-xs font-bold text-[#E8ECF5]">{f.name}</span>
                            </div>
                            <p className="text-[10px] text-[#4A5178] line-clamp-2 italic">
                              {f.content.substring(0, 100)}...
                            </p>
                          </div>
                        ))
                      ) : searchQuery && (
                        <div className="text-center py-12">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5178]">No results found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {sidebarTab === 'settings' && (
                  <div className="p-4 space-y-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5178]">Editor Settings</span>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#8B93B0] uppercase tracking-wider">
                        <Palette className="w-3.5 h-3.5" /> Text Color Profile
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {colorProfiles.map(p => (
                          <button
                            key={p.name}
                            onClick={() => updateSetting('textColor', p.value)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-[11px] font-bold",
                              editorSettings.textColor === p.value 
                                ? "bg-[#4775D1]/10 border-[#4775D1] text-[#E8ECF5]" 
                                : "bg-[#15181D] border-[#2A3149] text-[#4A5178] hover:border-[#8B93B0]"
                            )}
                          >
                            <span>{p.name}</span>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.value }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-[#2A3149]" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#8B93B0] uppercase tracking-wider">
                        <div className="flex items-center gap-2"><TypeIcon className="w-3.5 h-3.5" /> Font Size</div>
                        <span className="text-[#4775D1]">{editorSettings.fontSize}px</span>
                      </div>
                      <Slider 
                        value={[editorSettings.fontSize]} 
                        min={10} 
                        max={24} 
                        step={1} 
                        onValueChange={(v) => updateSetting('fontSize', v[0])}
                        className="py-2"
                      />
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Middle: Editor */}
            <div className="flex-1 relative flex flex-col min-w-0 bg-[#15181D]">
              <EditorSurface
                files={files}
                activeFileId={activeFileId}
                onFileSelect={setActiveFileId}
                onFileClose={(id) => id !== activeFileId && setFiles(f => f.filter(x => x.id !== id))}
                onNewFile={handleCreateFile}
                content={activeFile.content}
                onChange={(c) => handleUpdateFile(activeFile.id, { content: c })}
                onSelectionChange={setSelection}
                onStatsChange={setEditorStats}
                onAIAction={handleAIAction}
                onFormat={() => handleAIAction('format')}
                onRefine={(p) => p ? handleGenerate(p) : handleAIAction('format')}
                settings={editorSettings}
              />
            </div>

            {/* Right: AI Panel */}
            <div className={cn(
              "border-l border-[#2A3149] bg-[#1C2028]/80 backdrop-blur-xl transition-all overflow-hidden",
              isAiPanelOpen ? "w-[380px]" : "w-0 border-none"
            )}>
              <PromptConsole 
                onGenerate={handleGenerate}
                onAction={handleAIAction}
                isLoading={isLoading}
                history={promptHistory}
                activeChips={activeContextChips}
                onChipToggle={(chip) => setActiveContextChips(prev => 
                  prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
                )}
              />
            </div>
          </main>

          {/* Bottom: AI Output */}
          <AIOutputDisplay 
            output={aiOutput} 
            originalContent={generationContext?.text || activeFile.content}
            onAccept={applyAIChange} 
            onReject={() => { setAiOutput(''); setPipelineStep(-1); setGenerationContext(null); }}
            onRefine={() => handleGenerate(`Improve this result: ${aiOutput.substring(0, 50)}...`)}
            isLoading={isLoading}
            step={pipelineStep}
          />
        </div>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
