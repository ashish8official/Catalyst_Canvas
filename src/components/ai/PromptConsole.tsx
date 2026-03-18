
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  History, 
  Zap, 
  Terminal, 
  Send, 
  ArrowRight, 
  Type, 
  CheckCircle2, 
  Box, 
  BrainCircuit,
  Plus,
  Database,
  Code2,
  FileSearch,
  Settings2,
  Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PromptConsoleProps {
  onGenerate: (prompt: string, context: string[]) => void;
  onAction: (action: 'explain' | 'fix' | 'format') => void;
  isLoading: boolean;
  history: string[];
  onNewFile: () => void;
}

const AI_PURPLE = "#B478EA";

export function PromptConsole({ onGenerate, onAction, isLoading, history, onNewFile }: PromptConsoleProps) {
  const [prompt, setPrompt] = useState("");
  const [activeChips, setActiveChips] = useState<string[]>(["Full Doc", "Domain Mode"]);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, activeChips);
      setPrompt("");
    }
  };

  const domainTemplates = [
    { label: "SQL Optimize", domain: "SQL", icon: <Database className="w-3 h-3 text-blue-400" />, text: "Optimize this SQL query for better execution plan and performance." },
    { label: "PL/SQL Audit", domain: "PL/SQL", icon: <Terminal className="w-3 h-3 text-emerald-400" />, text: "Audit this PL/SQL block for exception handling and bulk operation best practices." },
    { label: "Doc Gen", domain: "General", icon: <Type className="w-3 h-3 text-purple-400" />, text: "Generate professional documentation for this implementation." },
    { label: "Logic Fix", domain: "General", icon: <Box className="w-3 h-3 text-destructive" />, text: "Identify and fix logical inconsistencies in this block." },
    { label: "Refactor", domain: "PL/SQL", icon: <Code2 className="w-3 h-3 text-amber-400" />, text: "Refactor this code to follow modular programming standards." },
    { label: "Explain Flow", domain: "SQL", icon: <FileSearch className="w-3 h-3 text-blue-300" />, text: "Explain the data flow and transformation logic step-by-step." },
  ];

  const chips = ["Full Doc", "Selection Only", "Schema", "Telecom", "Domain Mode"];

  const toggleChip = (chip: string) => {
    setActiveChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden border-l border-white/5">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#B478EA]/15 border border-[#B478EA]/20 shadow-[0_0_15px_rgba(180,120,234,0.15)]">
            <Sparkles className="w-4 h-4 text-[#B478EA]" />
          </div>
          <h2 className="font-headline font-bold text-sm tracking-widest uppercase text-foreground">AI Intelligence</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-mono border-[#B478EA]/20 text-[#B478EA] uppercase px-2">Gemini 2.5</Badge>
        </div>
      </div>

      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-5">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-secondary/40 p-1 border border-white/5 rounded-xl">
            <TabsTrigger value="console" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[#B478EA] data-[state=active]:text-white">
              <Cpu className="w-3.5 h-3.5 mr-2" /> Engine
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[#B478EA] data-[state=active]:text-white">
              <History className="w-3.5 h-3.5 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="console" className="flex-1 flex flex-col p-6 gap-6 mt-0 min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            {/* Context Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Target Context</label>
                <Settings2 className="w-3 h-3 text-muted-foreground/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleChip(c)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5",
                      activeChips.includes(c) 
                        ? "bg-[#B478EA]/20 border-[#B478EA]/40 text-[#B478EA] shadow-[0_0_10px_rgba(180,120,234,0.1)]" 
                        : "bg-secondary/40 border-white/5 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    {activeChips.includes(c) && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
               <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase border-white/5 hover:bg-[#B478EA]/10 hover:text-[#B478EA]" onClick={() => onAction('format')}>Format</Button>
               <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase border-white/5 hover:bg-[#B478EA]/10 hover:text-[#B478EA]" onClick={() => onAction('explain')}>Explain</Button>
               <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase border-white/5 hover:bg-destructive/10 hover:text-destructive" onClick={() => onAction('fix')}>Fix All</Button>
            </div>

            {/* Templates */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Domain Templates</label>
              <ScrollArea className="h-[180px] pr-3">
                <div className="grid grid-cols-1 gap-2">
                  {domainTemplates.map((t) => (
                    <Button
                      key={t.label}
                      variant="outline"
                      size="sm"
                      className="h-12 text-[10px] font-bold uppercase tracking-wider justify-start gap-3 bg-secondary/20 border-white/5 hover:border-[#B478EA]/50 hover:bg-[#B478EA]/5 transition-all text-muted-foreground hover:text-foreground group"
                      onClick={() => setPrompt(t.text)}
                    >
                      <div className="p-1.5 rounded-md bg-background border border-white/5 group-hover:border-[#B478EA]/30">
                        {t.icon}
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[9px] text-[#B478EA]/60 font-mono tracking-tighter">{t.domain}</span>
                        <span>{t.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#B478EA]/30 to-accent/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition duration-1000"></div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Instruct Catalyst..."
                className="relative min-h-[120px] bg-secondary/30 border-white/10 focus-visible:ring-[#B478EA]/40 p-5 pr-14 rounded-2xl resize-none placeholder:text-muted-foreground/30 text-sm leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-5 right-5 h-11 w-11 bg-[#B478EA] text-white hover:bg-[#B478EA]/90 hover:scale-105 active:scale-95 rounded-xl transition-all shadow-xl shadow-[#B478EA]/20"
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-0 mt-0 min-h-0">
          <ScrollArea className="h-full px-6 py-4">
            {history.length === 0 ? (
              <div className="text-center py-24 opacity-20">
                <History className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No logs recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-secondary/20 rounded-xl border border-white/5 group relative transition-all hover:bg-[#B478EA]/5 hover:border-[#B478EA]/20 cursor-pointer"
                    onClick={() => setPrompt(h)}
                  >
                    <div className="flex items-center gap-2 mb-2 opacity-40">
                      <Zap className="w-2.5 h-2.5 text-[#B478EA]" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Request Log {history.length - i}</span>
                    </div>
                    <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-2">{h}</p>
                    <ArrowRight className="absolute top-4 right-4 w-3 h-3 opacity-0 group-hover:opacity-40 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
