"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  X, 
  RefreshCw, 
  Copy, 
  Activity, 
  Search, 
  Braces, 
  Sparkles, 
  Terminal,
  ChevronRight,
  Fingerprint
} from "lucide-react";
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
  // Only show if we are loading or have output
  if (step === -1 && !output && !isLoading) return null;

  const pipeline = [
    { label: "Context Inject", icon: <Search className="w-3 h-3" /> },
    { label: "Template Expand", icon: <Braces className="w-3 h-3" /> },
    { label: "LLM Processing", icon: <Sparkles className="w-3 h-3" /> },
    { label: "Normalizing", icon: <Fingerprint className="w-3 h-3" /> },
    { label: "Diff Generating", icon: <Terminal className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-50 animate-in slide-in-from-bottom-full duration-500 ease-out">
      <div className="bg-[#15181D]/95 border border-[#B478EA]/30 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-3xl ring-1 ring-white/5">
        
        {/* Pipeline Progress Header */}
        <div className="px-8 py-4 bg-secondary/30 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#B478EA] animate-pulse shadow-[0_0_10px_#B478EA]" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#B478EA]">Intelligence Pipeline</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {pipeline.map((p, i) => (
                <React.Fragment key={p.label}>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-500 border",
                    step === i ? "bg-[#B478EA] border-[#B478EA] text-white shadow-lg shadow-[#B478EA]/20 scale-105" : 
                    step > i ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 opacity-80" : 
                    "border-white/5 text-muted-foreground opacity-30 bg-transparent"
                  )}>
                    {p.icon}
                    <span className="text-[9px] font-bold uppercase tracking-wider">{p.label}</span>
                  </div>
                  {i < pipeline.length - 1 && (
                    <ChevronRight className={cn(
                      "w-3 h-3 transition-opacity duration-500",
                      step > i ? "text-emerald-500/40" : "text-white/5"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="text-[9px] font-mono border-[#B478EA]/30 text-[#B478EA] uppercase px-2.5 h-6">
               {isLoading ? "Processing..." : "Ready for Merge"}
             </Badge>
          </div>
        </div>
        
        {/* Content Diff Area */}
        <div className="flex-1 flex min-h-[160px] max-h-[500px]">
          <ScrollArea className="flex-1 p-0 font-code text-[13px] leading-relaxed">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="relative">
                   <div className="w-14 h-14 border-2 border-[#B478EA]/10 border-t-[#B478EA] rounded-full animate-spin" />
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-[#B478EA] animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground/80">Synthesizing Content</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Stage: {pipeline[Math.min(step, 4)]?.label || "Initializing"}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 bg-black/40">
                {output.split('\n').map((line, i) => {
                  const isAdd = line.startsWith('+');
                  const isDel = line.startsWith('-');
                  return (
                    <div key={i} className={cn(
                      "flex gap-6 px-8 py-0.5 group transition-colors relative",
                      isAdd ? "bg-emerald-500/10 text-emerald-300/90 border-l-[3px] border-emerald-500" :
                      isDel ? "bg-destructive/10 text-destructive border-l-[3px] border-destructive opacity-50 line-through" :
                      "text-foreground/70 hover:bg-white/5 border-l-[3px] border-transparent"
                    )}>
                      {/* Generative Glow for changes */}
                      {(isAdd || isDel) && <div className="absolute inset-0 bg-[#B478EA]/5 pointer-events-none" />}
                      
                      <span className="w-10 text-right opacity-20 select-none font-mono text-[10px] shrink-0 pt-0.5">{i + 1}</span>
                      <pre className="whitespace-pre-wrap break-all font-code">{line}</pre>
                      
                      {isAdd && (
                         <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="text-[8px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase">Proposed</Badge>
                         </div>
                      )}
                    </div>
                  );
                })}
                {output === "" && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <Terminal className="w-10 h-10 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No changes detected in the delta</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Action Footer */}
        {!isLoading && output && (
          <div className="p-6 border-t border-white/5 bg-secondary/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="h-11 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive text-[11px] font-bold uppercase tracking-widest px-6 rounded-2xl transition-all"
                onClick={onReject}
              >
                <X className="w-4 h-4" />
                Discard
              </Button>
              <Button 
                variant="outline" 
                className="h-11 gap-2 text-[11px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5 px-6 rounded-2xl transition-all"
                onClick={onRefine}
              >
                <RefreshCw className="w-4 h-4" />
                Iterate Suggestion
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Button 
                  variant="ghost" size="icon" 
                  className="h-11 w-11 text-muted-foreground hover:text-[#B478EA] rounded-2xl transition-all" 
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipProvider>
              
              <Button 
                className="h-11 gap-3 bg-[#B478EA] hover:bg-[#B478EA]/90 text-white text-[11px] font-bold uppercase tracking-wider px-10 rounded-2xl shadow-[0_10px_30px_-5px_rgba(180,120,234,0.4)] transition-all active:scale-95"
                onClick={onAccept}
              >
                <Check className="w-4 h-4" />
                Apply Implementation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
