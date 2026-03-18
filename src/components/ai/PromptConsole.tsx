"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, History, Zap, Terminal, Send, ArrowRight, Type, CheckCircle2, Box, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface PromptConsoleProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  history: string[];
}

export function PromptConsole({ onGenerate, isLoading, history }: PromptConsoleProps) {
  const [prompt, setPrompt] = useState("");
  const [activeChips, setActiveChips] = useState<string[]>(["Active File", "Schema"]);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
      setPrompt("");
    }
  };

  const templates = [
    { label: "Summarize", icon: <Zap className="w-3 h-3 text-blue-400" />, text: "Summarize this logic in clear documentation comments." },
    { label: "Refactor", icon: <Terminal className="w-3 h-3 text-emerald-400" />, text: "Refactor this block to follow modern PL/SQL best practices." },
    { label: "Security", icon: <Box className="w-3 h-3 text-destructive" />, text: "Audit this block for common SQL injection or security vulnerabilities." },
    { label: "Expand", icon: <ArrowRight className="w-3 h-3 text-primary" />, text: "Expand this block with better error handling and logging." },
    { label: "Doc Gen", icon: <Type className="w-3 h-3 text-purple-400" />, text: "Generate comprehensive documentation for this entire file." },
    { label: "Fix Tone", icon: <BrainCircuit className="w-3 h-3 text-amber-400" />, text: "Make the variable naming and comments more professional." },
  ];

  const chips = ["Active File", "Schema", "History", "Project Rules"];

  const toggleChip = (chip: string) => {
    setActiveChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/15 border border-primary/20 shadow-[0_0_15px_rgba(111,86,229,0.15)]">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-headline font-bold text-sm tracking-widest uppercase text-foreground">AI Assistant</h2>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-primary uppercase">Catalyst v4.2</Badge>
      </div>

      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-5">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-secondary/40 p-1 border border-white/5 rounded-xl">
            <TabsTrigger value="console" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Terminal className="w-3.5 h-3.5 mr-2" /> Chat
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-3.5 h-3.5 mr-2" /> Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="console" className="flex-1 flex flex-col p-6 gap-6 mt-0 min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Context Chips</label>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleChip(c)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5",
                      activeChips.includes(c) 
                        ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(111,86,229,0.15)]" 
                        : "bg-secondary/40 border-white/5 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    {activeChips.includes(c) && <CheckCircle2 className="w-3 h-3" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.label}
                    variant="outline"
                    size="sm"
                    className="h-10 text-[10px] font-bold uppercase tracking-wider justify-start gap-2.5 bg-secondary/20 border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                    onClick={() => setPrompt(t.text)}
                  >
                    {t.icon}
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition duration-1000"></div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me to write, fix, or optimize anything..."
                className="relative min-h-[140px] bg-secondary/30 border-white/10 focus-visible:ring-primary/40 p-5 pr-14 rounded-2xl resize-none placeholder:text-muted-foreground/30 text-sm leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-5 right-5 h-11 w-11 bg-primary text-primary-foreground hover:scale-105 active:scale-95 rounded-xl transition-all shadow-xl shadow-primary/20"
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
              Context-Aware Engine active
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-0 mt-0 min-h-0">
          <ScrollArea className="h-full px-6 py-4">
            {history.length === 0 ? (
              <div className="text-center py-24 opacity-20">
                <History className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No history recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="p-5 bg-secondary/20 rounded-2xl border border-white/5 group relative transition-all hover:bg-secondary/40 hover:border-primary/20">
                    <p className="text-xs text-foreground/70 leading-relaxed pr-10">{h}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground rounded-lg"
                      onClick={() => setPrompt(h)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
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
