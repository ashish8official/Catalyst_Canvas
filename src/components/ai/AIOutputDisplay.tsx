'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  RefreshCw, 
  Sparkles, 
  ChevronRight,
  Terminal,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIOutputDisplayProps {
  output: string;
  originalContent: string;
  onAccept: () => void;
  onReject: () => void;
  onRefine: () => void;
  isLoading: boolean;
  step: number;
}

export function AIOutputDisplay({ 
  output, 
  originalContent,
  onAccept, 
  onReject, 
  onRefine, 
  isLoading, 
  step 
}: AIOutputDisplayProps) {
  const [height, setHeight] = useState(400);

  if (step === -1 && !output && !isLoading) return null;

  const pipeline = [
    { label: "Context", id: 0 },
    { label: "Expand", id: 1 },
    { label: "Generate", id: 2 },
    { label: "Normalize", id: 3 },
    { label: "Diff", id: 4 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full duration-500 ease-out">
      <div 
        className="bg-[#1C2028] border-t border-[#B478EA]/40 shadow-[0_-20px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col backdrop-blur-3xl"
        style={{ height: `${height}px` }}
      >
        {/* Resize Handle */}
        <div className="h-1 w-full bg-[#2A3149] cursor-ns-resize hover:bg-[#B478EA] transition-colors" />

        {/* Header */}
        <div className="px-8 py-4 border-b border-[#2A3149] flex items-center justify-between bg-[#222837]/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#B478EA]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">AI Suggestion</span>
              <Badge variant="outline" className="text-[9px] border-[#B478EA]/30 text-[#B478EA] uppercase px-2 h-5">Proposed Implementation</Badge>
            </div>
            
            {/* Pipeline Tracker */}
            <div className="hidden md:flex items-center gap-2">
              {pipeline.map((p, i) => (
                <React.Fragment key={p.id}>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-500",
                    step === i ? "bg-[#B478EA] text-white shadow-lg shadow-[#B478EA]/20 scale-105" : 
                    step > i ? "text-[#34D399] opacity-80" : 
                    "text-[#4A5178] opacity-30"
                  )}>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{p.label}</span>
                  </div>
                  {i < pipeline.length - 1 && <ChevronRight className={cn("w-3 h-3", step > i ? "text-[#34D399]/40" : "text-[#4A5178]")} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#4A5178] font-mono mr-4">
              <span className="px-1.5 py-0.5 bg-[#222837] rounded border border-[#2A3149]">⌘↵ Accept</span>
              <span className="px-1.5 py-0.5 bg-[#222837] rounded border border-[#2A3149]">Esc Reject</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 px-4 text-[#F87171] hover:bg-[#F87171]/10 text-[10px] font-bold uppercase rounded-lg"
                onClick={onReject}
              >
                <X className="w-3.5 h-3.5 mr-2" /> Reject
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="h-9 px-4 border-[#2A3149] hover:bg-[#222837] text-[10px] font-bold uppercase rounded-lg"
                onClick={onRefine}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refine
              </Button>
              <Button 
                size="sm"
                className="h-9 px-6 bg-[#B478EA] hover:bg-[#B478EA]/90 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg shadow-[#B478EA]/20"
                onClick={onAccept}
              >
                <Check className="w-3.5 h-3.5 mr-2" /> Accept Implementation
              </Button>
            </div>
          </div>
        </div>

        {/* Split View Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Original */}
          <div className="flex-1 border-r border-[#2A3149] bg-[#15181D]/40 flex flex-col">
            <div className="p-3 bg-[#1C2028]/60 text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A5178] border-b border-[#2A3149]">Original Content</div>
            <ScrollArea className="flex-1 p-6 font-mono text-[13px] text-[#4A5178] leading-relaxed">
              <pre className="whitespace-pre-wrap">{originalContent}</pre>
            </ScrollArea>
          </div>

          {/* Right: Suggestion */}
          <div className="flex-1 bg-[#15181D] flex flex-col">
            <div className="p-3 bg-[#1C2028]/60 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B478EA] border-b border-[#2A3149]">AI Suggestion</div>
            <ScrollArea className="flex-1 p-0 font-mono text-[13px] leading-relaxed">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-10 h-10 border-2 border-[#B478EA]/20 border-t-[#B478EA] rounded-full animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing Implementation...</span>
                </div>
              ) : (
                <div className="py-6">
                  {output.split('\n').map((line, i) => {
                    const isNew = line.trim() && !originalContent.includes(line.trim());
                    return (
                      <div key={i} className={cn(
                        "flex gap-6 px-8 py-0.5 group relative transition-all",
                        isNew ? "bg-[#34D399]/5 text-[#34D399] border-l-[3px] border-[#34D399]" : "text-[#E8ECF5]/60 border-l-[3px] border-transparent"
                      )}>
                        {isNew && <div className="absolute inset-0 bg-[#B478EA]/5 pointer-events-none" />}
                        <span className="w-8 text-right opacity-20 select-none text-[10px] shrink-0 pt-0.5">{i + 1}</span>
                        <pre className="whitespace-pre-wrap font-mono">{line}</pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
