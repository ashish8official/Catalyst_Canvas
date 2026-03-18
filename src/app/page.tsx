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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DebugPanel } from '@/components/debug/DebugPanel';

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
  
  // Persistence logic for AI Panel
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

  // Global State
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'debug' | 'search' | 'settings'>('explorer');
  const [selection, setSelection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [pipelineStep, setPipelineStep] = useState<number>(-1);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [activeContextChips, setActiveContextChips] = useState<string[]>(['FULL DOC']);
  
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
  };

  const handleUpdateFile = (id: string, updates: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const simulatePipeline = async (action: () => Promise<string>) => {
    setIsLoading(true);
    setAiOutput('');
    setPipelineStep(0); // Context
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(1); // Expand
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(2); // Generate
    
    try {
      const result = await action();
      setPipelineStep(3); // Normalize
      await new Promise(r => setTimeout(r, 600));
      setPipelineStep(4); // Diff
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

    simulatePipeline(async () => {
      if (selection || useSelection) {
        const res = await refineSelectedText({ selectedText: targetText, refinementPrompt: promptText });
        return res.refinedText;
      } else {
        const res = await generateNewContentFromPrompt({ prompt: promptText });
        return res.generatedContent;
      }
    });
  };

  const handleAIAction = (action: 'explain' | 'fix' | 'format' | 'optimize' | 'summarize') => {
    if (action === 'format') {
      simulatePipeline(async () => {
        const res = await formatContent({ 
          content: selection || activeFile.content, 
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
          codeSnippet: selection || activeFile.content,
          action: actionMap[action] || 'explain',
          language: activeFile.language
        });
        return res.explanationOrFix;
      });
    }
  };

  const applyAIChange = () => {
    if (selection) {
      handleUpdateFile(activeFile.id, { 
        content: activeFile.content.replace(selection, aiOutput) 
      });
    } else {
      handleUpdateFile(activeFile.id, { content: aiOutput });
    }
    setAiOutput('');
    setPipelineStep(-1);
    toast({ title: 'Implementation Merged', description: 'AI changes applied successfully.' });
  };

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
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'search' && "text-[#4775D1] bg-[#4775D1]/10")} onClick={() => setSidebarTab('search')}><SearchCode className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-10 w-10", sidebarTab === 'settings' && "text-[#4775D1] bg-[#4775D1]/10")} onClick={() => setSidebarTab('settings')}><Settings className="w-5 h-5" /></Button>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#222837] border border-[#2A3149] flex items-center justify-center cursor-pointer hover:bg-[#2A3149] transition-colors">
            <UserCircle className="w-6 h-6 text-[#8B93B0]" />
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Global Header */}
          <header className="h-16 border-b border-[#2A3149] px-6 flex items-center justify-between bg-[#1C2028]/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B478EA]" />
                <h1 className="font-headline font-bold text-lg tracking-tight">Catalyst<span className="text-[#B478EA]">.</span>Canvas</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#222837] rounded-full border border-[#2A3149]">
                <Globe className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B93B0]">Live Environment</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-9 w-9 rounded-xl transition-all", isAiPanelOpen ? "text-[#4775D1] bg-[#4775D1]/10" : "text-[#8B93B0]")}
                    onClick={toggleAiPanel}
                  >
                    {isAiPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle AI Panel</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Editor & AI Console */}
          <main className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Left: Sidebar Content */}
            <div className={cn("w-64 border-r border-[#2A3149] bg-[#1C2028]/40 transition-all overflow-hidden", sidebarTab === 'debug' ? 'w-80' : 'w-64')}>
              {sidebarTab === 'explorer' && (
                <div className="p-4 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5178]">Explorer</span>
                  <div className="space-y-1">
                    {files.map(f => (
                      <div 
                        key={f.id}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm flex items-center gap-3 cursor-pointer transition-colors",
                          activeFileId === f.id ? "bg-[#4775D1]/10 text-[#4775D1]" : "text-[#8B93B0] hover:bg-[#222837]"
                        )}
                        onClick={() => setActiveFileId(f.id)}
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span className="truncate">{f.name}</span>
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
            originalContent={selection || activeFile.content}
            onAccept={applyAIChange} 
            onReject={() => { setAiOutput(''); setPipelineStep(-1); }}
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
