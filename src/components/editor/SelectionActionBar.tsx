
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  Bug, 
  ArrowRight, 
  X,
  AlignLeft,
  SearchCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionActionBarProps {
  position: { top: number; left: number };
  onAction: (type: string) => void;
  onClose: () => void;
}

export function SelectionActionBar({ position, onAction, onClose }: SelectionActionBarProps) {
  const actions = [
    { label: "Refine", type: "refine", icon: <Sparkles className="w-3.5 h-3.5 text-[#B478EA]" />, prompt: "Refine and improve this block while keeping its core logic." },
    { label: "Explain", type: "explain", icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />, prompt: "explain" },
    { label: "Fix", type: "fix", icon: <Bug className="w-3.5 h-3.5 text-destructive" />, prompt: "fix" },
    { label: "Optimize", type: "optimize", icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, prompt: "optimize" },
    { label: "Summarize", type: "summarize", icon: <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />, prompt: "summarize" },
  ];

  return (
    <div 
      className="fixed z-[60] flex items-center bg-[#15181D]/95 border border-[#B478EA]/30 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] backdrop-blur-3xl p-1.5 animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
    >
      <div className="flex gap-1 pr-1.5 border-r border-white/10">
        {actions.map((act) => (
          <Button
            key={act.label}
            variant="ghost"
            size="sm"
            className="h-9 px-3.5 gap-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-[#B478EA]/10 rounded-xl transition-all"
            onClick={() => { 
              onAction(act.type); 
              onClose(); 
            }}
          >
            {act.icon}
            {act.label}
          </Button>
        ))}
      </div>
      <Button 
        variant="ghost" size="icon" 
        className="h-9 w-9 ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
