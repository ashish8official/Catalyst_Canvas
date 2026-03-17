
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
    { label: "SQL Optimization", icon: <Terminal className="w-3 h-3" />, text: "Optimize this SQL query for better performance." },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent/10">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <h2 className="font-headline font-semibold text-sm">Prompt Console</h2>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-accent/20 text-accent">AI ENGINE v2.5</Badge>
      </div>

      <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="console" className="text-xs">
              <Terminal className="w-3.5 h-3.5 mr-2" /> Console
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-3.5 h-3.5 mr-2" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="console" className="flex-1 flex flex-col p-4 gap-4 mt-0 min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Templates</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.label}
                    variant="secondary"
                    size="sm"
                    className="h-7 text-[10px] gap-1.5 bg-secondary/50 hover:bg-secondary border border-transparent hover:border-accent/30"
                    onClick={() => setPrompt(t.text)}
                  >
                    {t.icon}
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-secondary/30 rounded-xl border border-dashed border-border p-4 justify-center items-center text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Enter a natural language command to generate or modify content.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Catalyst..."
                className="min-h-[100px] bg-secondary/50 border-accent/10 focus-visible:ring-accent/50 pr-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8 bg-accent hover:bg-accent/80 text-accent-foreground rounded-full transition-transform active:scale-90"
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground italic">
              Tip: Highlight text in the editor to refine specific sections.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-0 mt-0 min-h-0">
          <ScrollArea className="h-[calc(100vh-200px)] px-4 py-4">
            {history.length === 0 ? (
              <div className="text-center py-10">
                <History className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No prompt history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-lg border border-border group relative">
                    <p className="text-xs text-foreground line-clamp-2 pr-6">{h}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPrompt(h)}
                    >
                      <ArrowRight className="w-3 h-3" />
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
