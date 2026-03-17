
"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Code2, Type, FileText, Wand2, Bug, Save, MoreHorizontal } from "lucide-react";

interface EditorSurfaceProps {
  fileName: string;
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: string) => void;
  mode: "text" | "code";
  language: string;
  onRefine: () => void;
  onDebug: () => void;
}

export function EditorSurface({
  fileName,
  content,
  onChange,
  onSelectionChange,
  mode,
  language,
  onRefine,
  onDebug,
}: EditorSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selection = textareaRef.current.value.substring(start, end);
      onSelectionChange(selection);
    }
  };

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Shift') return;
      handleSelection();
    };
    const current = textareaRef.current;
    current?.addEventListener('keyup', handleKeyUp);
    return () => current?.removeEventListener('keyup', handleKeyUp);
  }, []);

  return (
    <div className="flex flex-col h-full bg-card/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg border border-white/5">
            {mode === "code" ? <Code2 className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-xs font-semibold tracking-wide text-foreground/80">{fileName}</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Type className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 gap-2 text-xs font-medium hover:bg-white/10"
            onClick={onRefine}
          >
            <Wand2 className="w-4 h-4 text-primary" />
            AI Refine
          </Button>
          {mode === "code" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 gap-2 text-xs font-medium hover:bg-white/10"
              onClick={onDebug}
            >
              <Bug className="w-4 h-4 text-destructive/80" />
              Debug
            </Button>
          )}
          <Button size="sm" className="h-9 gap-2 bg-primary text-background hover:bg-primary/90 text-xs px-4">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="relative flex-1 bg-black/20">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onMouseUp={handleSelection}
          placeholder={mode === "code" ? "Start coding..." : "Start writing..."}
          className={cn(
            "w-full h-full p-8 bg-transparent resize-none focus:outline-none focus:ring-0 leading-relaxed caret-primary",
            mode === "code" ? "font-code text-sm" : "font-body text-base"
          )}
          spellCheck={false}
        />
        
        <div className="absolute bottom-6 right-8 flex items-center gap-4 text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase pointer-events-none">
          <span>{language}</span>
          <span className="h-3 w-px bg-white/10" />
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
