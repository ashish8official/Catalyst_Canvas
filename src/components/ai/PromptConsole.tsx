
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, History, MessageSquare, Zap, Terminal, Send, ArrowRight, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PromptConsoleProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  history: string[];
}

export function PromptConsole({ onGenerate, isLoading, history }: PromptConsoleProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
      setPrompt("");
    }
  };

  const templates = [
    { label: "Summarize", icon: <Zap className="w-3 h-3" />, text: "Summarize this content in 3 bullet points." },
    { label: "Refactor", icon: <Terminal className="w-3 h-3" />, text: "Refactor this code to follow clean code principles." },
    { label: "Fix Grammar", icon: <Type className="w-3 h-3" />, text: "Fix the grammar and tone of this text." },
    { label: "Optimize", icon: <Zap className="w-3 h-3" />, text: "Optimize this for better performance." },
  ];

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-headline font-bold text-sm tracking-wide">AI Assistant</h2>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-muted-foreground">GENESIS v4</Badge>
      </div>

      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-black/20 p-1">
            <TabsTrigger value="console" className="text-xs data-[state=active]:bg-accent">
              <Terminal className="w-3.5 h-3.5 mr-2" /> Chat
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs data-[state=active]:bg-accent">
              <History className="w-3.5 h-3.5 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="console" className="flex-1 flex flex-col p-5 gap-6 mt-0 min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.label}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] gap-2 bg-accent/20 border-white/5 hover:border-primary/50 transition-all"
                    onClick={() => setPrompt(t.text)}
                  >
                    {t.icon}
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-black/10 rounded-2xl border border-white/5 p-6 justify-center items-center text-center">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                I'm your intelligent collaborator. Ask me to write, refactor, or explain anything.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for anything..."
                className="relative min-h-[120px] bg-accent/30 border-white/5 focus-visible:ring-primary/50 p-4 pr-12 rounded-xl resize-none placeholder:text-muted-foreground/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-4 right-4 h-9 w-9 bg-primary text-background hover:scale-105 active:scale-95 rounded-xl transition-all"
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
              Pro tip: Highlight code for targeted AI analysis
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-0 mt-0 min-h-0">
          <ScrollArea className="h-[calc(100vh-250px)] px-5 py-4">
            {history.length === 0 ? (
              <div className="text-center py-16 opacity-30">
                <History className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 group relative transition-colors hover:bg-white/10">
                    <p className="text-xs text-foreground/80 line-clamp-2 pr-8">{h}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-background"
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
