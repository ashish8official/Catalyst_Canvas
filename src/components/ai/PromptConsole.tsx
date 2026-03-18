'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  History, 
  Send, 
  Braces, 
  MessageSquare, 
  Bug, 
  Database,
  Terminal,
  Type,
  ArrowRight,
  Clock,
  Trash2,
  Cpu,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PromptConsoleProps {
  onGenerate: (prompt: string) => void;
  onAction: (action: any) => void;
  isLoading: boolean;
  history: string[];
  activeChips: string[];
  onChipToggle: (chip: string) => void;
}

export function PromptConsole({ 
  onGenerate, 
  onAction, 
  isLoading, 
  history,
  activeChips,
  onChipToggle
}: PromptConsoleProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  const templates = [
    { section: 'SQL', items: [
      { label: 'Optimize query', text: 'Optimize this SQL query for better execution plan and indexing.' },
      { label: 'Add indexes', text: 'Suggest appropriate indexes for these table structures.' }
    ]},
    { section: 'PL/SQL', items: [
      { label: 'Add exception handling', text: 'Refactor this PL/SQL block to include robust exception handling.' },
      { label: 'Modularize procedure', text: 'Break down this large procedure into smaller, reusable functions.' }
    ]},
    { section: 'GENERAL', items: [
      { label: 'Summarize logic', text: 'Explain the business logic of this code step-by-step.' },
      { label: 'Add comments', text: 'Improve the documentation and comments for clarity.' }
    ]}
  ];

  const chips = ['FULL DOC', 'SELECTION ONLY', 'SCHEMA', 'TELECOM', 'DOMAIN MODE'];

  return (
    <div className="flex flex-col h-full bg-[#1C2028]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#2A3149] flex items-center justify-between bg-[#222837]/30">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#B478EA]" />
          <h2 className="font-headline font-bold text-sm tracking-[0.2em] uppercase">AI Intelligence</h2>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono border-[#B478EA]/40 text-[#B478EA] uppercase px-2 py-0.5">
          Gemini 2.5
        </Badge>
      </div>

      <Tabs defaultValue="engine" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-5">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-[#15181D] p-1 border border-[#2A3149] rounded-xl">
            <TabsTrigger value="engine" className="text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-[#B478EA] data-[state=active]:text-white transition-all">
              <Zap className="w-3 h-3 mr-2" /> Engine
            </TabsTrigger>
            <TabsTrigger value="history" className="text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-[#B478EA] data-[state=active]:text-white transition-all">
              <Clock className="w-3 h-3 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="engine" className="flex-1 flex flex-col p-6 gap-8 mt-0 min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 pr-3">
            <div className="space-y-8">
              {/* Context Selection */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#4A5178] uppercase tracking-[0.2em]">Target Context</span>
                <div className="flex flex-wrap gap-2">
                  {chips.map(c => (
                    <button
                      key={c}
                      onClick={() => onChipToggle(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all",
                        activeChips.includes(c) 
                          ? "bg-[#B478EA]/10 border-[#B478EA] text-[#B478EA] shadow-[0_0_15px_rgba(180,120,234,0.1)]" 
                          : "bg-[#15181D] border-[#2A3149] text-[#4A5178] hover:border-[#8B93B0]"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#4A5178] uppercase tracking-[0.2em]">Quick Actions</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-[9px] font-bold uppercase border-[#2A3149] hover:bg-[#B478EA]/10 hover:text-[#B478EA]" onClick={() => onAction('format')}>Format</Button>
                  <Button variant="outline" size="sm" className="h-9 text-[9px] font-bold uppercase border-[#2A3149] hover:bg-[#B478EA]/10 hover:text-[#B478EA]" onClick={() => onAction('explain')}>Explain</Button>
                  <Button variant="outline" size="sm" className="h-9 text-[9px] font-bold uppercase border-[#2A3149] hover:bg-[#F87171]/10 hover:text-[#F87171]" onClick={() => onAction('fix')}>Fix All</Button>
                </div>
              </div>

              {/* Templates */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#4A5178] uppercase tracking-[0.2em]">Prompt Templates</span>
                <div className="space-y-4">
                  {templates.map(sect => (
                    <div key={sect.section} className="space-y-2">
                      <div className="text-[9px] font-bold text-[#4A5178] px-1">{sect.section}</div>
                      <div className="grid grid-cols-1 gap-2">
                        {sect.items.map(t => (
                          <Button
                            key={t.label}
                            variant="ghost"
                            size="sm"
                            className="h-auto py-2.5 px-3 justify-start text-[10px] font-bold uppercase tracking-wider bg-[#15181D] border border-[#2A3149] hover:border-[#B478EA]/40 text-[#8B93B0] hover:text-[#E8ECF5] group"
                            onClick={() => setPrompt(t.text)}
                          >
                            <ArrowRight className="w-3 h-3 mr-3 text-[#B478EA] opacity-40 group-hover:opacity-100" />
                            {t.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Prompt Area */}
          <div className="pt-4 border-t border-[#2A3149]">
            <div className={cn(
              "relative rounded-2xl border transition-all duration-500 overflow-hidden bg-[#15181D]",
              isLoading ? "border-[#B478EA] shadow-[0_0_30px_rgba(180,120,234,0.15)]" : "border-[#2A3149] hover:border-[#B478EA]/40"
            )}>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isLoading ? "Catalyst is thinking..." : "Instruct Catalyst..."}
                className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 p-5 text-sm leading-relaxed text-[#E8ECF5] placeholder-[#4A5178] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {isLoading && <div className="flex gap-1 animate-pulse"><div className="w-1 h-1 bg-[#B478EA] rounded-full" /><div className="w-1 h-1 bg-[#B478EA] rounded-full" /><div className="w-1 h-1 bg-[#B478EA] rounded-full" /></div>}
                <Button
                  size="icon"
                  className="h-10 w-10 bg-[#B478EA] text-white hover:bg-[#B478EA]/90 rounded-xl transition-all shadow-xl shadow-[#B478EA]/20 disabled:opacity-30"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 min-h-0">
          <ScrollArea className="h-full p-6">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-20 gap-4">
                <History className="w-12 h-12" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center px-12">No prompts yet.<br/>Start instructing Catalyst.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="p-4 bg-[#15181D] border border-[#2A3149] rounded-xl hover:border-[#B478EA]/30 transition-all cursor-pointer group" onClick={() => setPrompt(h)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-bold text-[#4A5178] uppercase tracking-widest">Prompt Log</span>
                      <history className="w-3 h-3 text-[#B478EA] opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-[11px] text-[#8B93B0] line-clamp-2 leading-relaxed italic">"{h}"</p>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase text-[#4A5178] hover:text-[#F87171] mt-4">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Clear History
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
