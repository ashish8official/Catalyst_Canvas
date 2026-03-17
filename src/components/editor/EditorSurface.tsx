"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Braces, Save, MoreHorizontal, Database } from "lucide-react";
import { SelectionActionBar } from "./SelectionActionBar";

interface EditorSurfaceProps {
  fileName: string;
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: string) => void;
  mode: "text" | "code";
  language: string;
  onRefine: (prompt?: string) => void;
  onFormat: () => void;
}

export function EditorSurface({
  fileName,
  content,
  onChange,
  onSelectionChange,
  mode,
  language,
  onRefine,
  onFormat,
}: EditorSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [showSelectionBar, setShowSelectionBar] = useState(false);
  const [barPosition, setBarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setLineCount(content.split("\n").length);
  }, [content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = textareaRef.current.value.substring(start, end);
      onSelectionChange(selected);

      if (selected.trim().length > 0) {
        const { clientX, clientY } = (e as React.MouseEvent);
        if (clientX && clientY) {
          setBarPosition({ top: clientY - 60, left: clientX });
          setShowSelectionBar(true);
        }
      } else {
        setShowSelectionBar(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 border border-white/5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/20">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-secondary/20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-white/10">
            {language === "SQL" || language === "PL/SQL" ? <Database className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-primary" />}
            <span className="text-xs font-bold tracking-wide text-foreground/90">{fileName}</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{language} Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" size="sm" 
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            onClick={onFormat}
          >
            <Braces className="w-3.5 h-3.5" />
            AI Format
          </Button>
          <Button size="sm" className="h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase px-4 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Save className="w-3.5 h-3.5" />
            Commit
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="relative flex-1 bg-background/40 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 bg-secondary/10 border-r border-white/5 py-8 text-right pr-3 select-none flex flex-col font-code text-[11px] text-muted-foreground/30 leading-relaxed">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            placeholder={mode === "code" ? "-- Start writing code..." : "Start writing notes..."}
            className={cn(
              "w-full h-full p-8 bg-transparent resize-none focus:outline-none focus:ring-0 leading-relaxed caret-primary transition-all scrollbar-hide",
              mode === "code" ? "font-code text-[13px]" : "font-body text-[15px]"
            )}
            spellCheck={false}
          />
          
          <div className="absolute bottom-6 right-8 flex items-center gap-4 text-[9px] text-muted-foreground/40 font-bold tracking-widest uppercase pointer-events-none group-hover:text-primary/40 transition-colors">
            <span>{language}</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Col: {content.length}</span>
            <span className="h-3 w-px bg-white/10" />
            <span>UTF-8</span>
          </div>
        </div>
      </div>

      {/* Selection Action Bar */}
      {showSelectionBar && (
        <SelectionActionBar 
          position={barPosition} 
          onAction={(type) => onRefine(type)}
          onClose={() => setShowSelectionBar(false)}
        />
      )}
    </div>
  );
}
