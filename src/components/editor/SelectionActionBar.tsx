"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, MessageSquare, Bug, ArrowRight, X } from "lucide-react";

interface SelectionActionBarProps {
  position: { top: number; left: number };
  onAction: (prompt: string) => void;
  onClose: () => void;
}

export function SelectionActionBar({ position, onAction, onClose }: SelectionActionBarProps) {
  const actions = [
    { label: "Refine", icon: <Sparkles className="w-3 h-3 text-primary" />, prompt: "Refine and improve this block while keeping its core logic." },
    { label: "Explain", icon: <MessageSquare className="w-3 h-3 text-blue-400" />, prompt: "Explain what this block of code does in simple terms." },
    { label: "Fix", icon: <Bug className="w-3 h-3 text-destructive" />, prompt: "Find and fix any potential bugs or syntax errors in this block." },
    { label: "Optimize", icon: <Zap className="w-3 h-3 text-amber-400" />, prompt: "Optimize this block for better performance and readability." },
  ];

  return (
    <div 
      className="fixed z-[60] flex items-center bg-card/95 border border-primary/20 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl p-1 animate-in zoom-in-95 duration-200"
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
    >
      <div className="flex gap-1 pr-1 border-r border-white/10">
        {actions.map((act) => (
          <Button
            key={act.label}
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-primary/10"
            onClick={() => { onAction(act.prompt); onClose(); }}
          >
            {act.icon}
            {act.label}
          </Button>
        ))}
      </div>
      <Button 
        variant="ghost" size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onClose}
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}