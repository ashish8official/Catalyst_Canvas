"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw, Copy, Layers, Activity, Search, Braces, Sparkles, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIOutputDisplayProps {
  output: string;
  onAccept: () => void;
  onReject: () => void;
  onRefine: () => void;
  isLoading: boolean;
  step: number;
}

export function AIOutputDisplay({ output, onAccept, onReject, onRefine, isLoading, step }: AIOutputDisplayProps) {
  if (step === -1 && !output) return null;

  const pipeline = [
    { label: "Context Inject", icon: <Search className="w-3 h-3" /> },
    { label: "Template Expand", icon: <Braces className="w-3 h-3" /> },
    { label: "LLM Processing", icon: <Sparkles className="w-3 h-3" /> },
    { label: "Normalizing", icon: <Activity className="w-3 h-3" /> },
    { label: "Diff Generating", icon: <Terminal className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 animate-in slide-in-from-bottom-10 duration-700 ease-out">
      <div className="bg-card/95 border border-primary/20 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Header with Pipeline Steps */}
        <div className="px-6 py-3 bg-secondary/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">AI Pipeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              {pipeline.map((p, i) => (
                <React.Fragment key={p.label}>
                  <div className={cn(
                    "flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all duration-500",
                    step === i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : 
                    step > i ? "text-emerald-500 opacity-60" : "text-muted-foreground opacity-30"
                  )}>
                    {p.icon}
                    <span className="text-[9px] font-bold uppercase tracking-wider">{p.label}</span>
                  </div>
                  {i < pipeline.length - 1 && <div className="w-3 h-px bg-white/10" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="text-[9px] font-bold h-6 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest px-3">Sync Stable</Badge>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex min-h-[120px] max-h-[450px]">
          <ScrollArea className="flex-1 p-8 bg-black/20 font-code text-[13px] leading-relaxed text-foreground/90">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Calculating optimal output...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {output.split('\n').map((line, i) => {
                  const isAdd = line.startsWith('+');
                  const isDel = line.startsWith('-');
                  return (
                    <div key={i} className={cn(
                      "flex gap-4 px-3 py-0.5 rounded transition-colors",
                      isAdd ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500" :
                      isDel ? "bg-destructive/10 text-destructive border-l-2 border-destructive opacity-60" :
                      "text-muted-foreground/80"
                    )}>
                      <span className="w-6 text-right opacity-20 select-none">{i + 1}</span>
                      <pre className="whitespace-pre-wrap">{line}</pre>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        {!isLoading && output && (
          <div className="p-5 border-t bg-secondary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 gap-2 border-destructive/20 hover:bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-widest px-5 rounded-xl"
                onClick={onReject}
              >
                <X className="w-4 h-4" />
                Discard Change
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 gap-2 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5 px-5 rounded-xl"
                onClick={onRefine}
              >
                <RefreshCw className="w-4 h-4" />
                Iterate
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" size="icon" 
                className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl" 
                onClick={() => navigator.clipboard.writeText(output)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                className="h-10 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-8 rounded-xl shadow-xl shadow-primary/30"
                onClick={onAccept}
              >
                <Check className="w-4 h-4" />
                Accept Implementation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}