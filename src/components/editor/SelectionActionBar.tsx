'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  MessageSquare, 
  Bug, 
  Zap, 
  AlignLeft, 
  Music,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionActionBarProps {
  position: { top: number; left: number };
  onAction: (type: string) => void;
  onClose: () => void;
}

export function SelectionActionBar({ position, onAction, onClose }: SelectionActionBarProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const actions = [
    { label: 'Refine', type: 'refine', icon: Sparkles },
    { label: 'Explain', type: 'explain', icon: MessageSquare },
    { label: 'Fix', type: 'fix', icon: Bug },
    { label: 'Optimize', type: 'optimize', icon: Zap },
    { label: 'Summarize', type: 'summarize', icon: AlignLeft },
    { label: 'Tone', type: 'tone', icon: Music },
  ];

  return (
    <div 
      className="fixed z-[60] flex items-center bg-[#1C2028] border border-[#B478EA]/40 rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl p-1 animate-in zoom-in-95 duration-200"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -100%) translateY(-20px)' }}
    >
      <div className="flex gap-0.5 px-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Tooltip key={act.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8B93B0] hover:text-[#B478EA] hover:bg-[#B478EA]/10 rounded-full transition-all"
                  onClick={() => { onAction(act.type); onClose(); }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{act.label}</span>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          );
        })}
      </div>
      <div className="w-px h-4 bg-[#2A3149] mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-[#4A5178] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded-full"
        onClick={onClose}
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// Minimal tooltip mock to prevent crashes if TooltipProvider isn't wrapped
function Tooltip({ children }: any) { return children; }
function TooltipTrigger({ children, asChild }: any) { return children; }
