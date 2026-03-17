
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw, Copy, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AIOutputDisplayProps {
  output: string;
  onAccept: () => void;
  onReject: () => void;
  onRefine: () => void;
  isApplying: boolean;
}

export function AIOutputDisplay({ output, onAccept, onReject, onRefine, isApplying }: AIOutputDisplayProps) {
  if (!output) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-card border border-accent/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
        <div className="flex items-center justify-between px-4 py-2 bg-accent/10 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold font-headline tracking-wide uppercase">AI Suggestion</span>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="text-[10px] h-5 bg-background border-accent/20">New Version</Badge>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => navigator.clipboard.writeText(output)}>
               <Copy className="w-3.5 h-3.5" />
             </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6 font-body text-sm leading-relaxed text-foreground/90 bg-secondary/10">
          <pre className="whitespace-pre-wrap font-inherit">{output}</pre>
        </ScrollArea>

        <div className="p-4 border-t bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 border-destructive/20 hover:bg-destructive/10 text-destructive text-xs"
              onClick={onReject}
            >
              <X className="w-4 h-4" />
              Discard
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 text-xs border-primary/20 hover:bg-primary/10"
              onClick={onRefine}
            >
              <RefreshCw className="w-4 h-4" />
              Refine
            </Button>
          </div>
          <Button 
            size="sm" 
            className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-6 shadow-lg shadow-primary/20"
            onClick={onAccept}
            disabled={isApplying}
          >
            {isApplying ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Apply Change
          </Button>
        </div>
      </div>
    </div>
  );
}
