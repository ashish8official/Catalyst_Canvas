
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Code2, Type, FileText, ChevronDown, Wand2, Bug, Save } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorSurfaceProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: string) => void;
  mode: "text" | "code";
  language: string;
  setMode: (mode: "text" | "code") => void;
  setLanguage: (lang: string) => void;
  onRefine: () => void;
  onDebug: () => void;
}

export function EditorSurface({
  content,
  onChange,
  onSelectionChange,
  mode,
  language,
  setMode,
  setLanguage,
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
    <div className="flex flex-col h-full bg-card border rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
                {mode === "code" ? <Code2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <span className="text-xs font-medium capitalize">{mode === "code" ? `${language}` : "Rich Text"}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { setMode("text"); setLanguage("Plain Text"); }}>
                <FileText className="w-4 h-4 mr-2" /> Rich Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMode("code"); setLanguage("SQL"); }}>
                <Code2 className="w-4 h-4 mr-2" /> SQL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMode("code"); setLanguage("TypeScript"); }}>
                <Code2 className="w-4 h-4 mr-2" /> TypeScript
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border mx-1" />

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Type className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-2 border-primary/20 hover:border-primary/50 text-xs"
            onClick={onRefine}
          >
            <Wand2 className="w-3.5 h-3.5 text-accent" />
            AI Refine
          </Button>
          {mode === "code" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2 border-primary/20 hover:border-primary/50 text-xs"
              onClick={onDebug}
            >
              <Bug className="w-3.5 h-3.5 text-destructive" />
              Debug
            </Button>
          )}
          <Button size="sm" className="h-8 gap-2 bg-primary hover:bg-primary/90 text-xs">
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="relative flex-1 group">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onMouseUp={handleSelection}
          placeholder={mode === "code" ? "Start typing your code here..." : "Begin writing your creative masterpiece..."}
          className={cn(
            "w-full h-full p-6 bg-transparent resize-none focus:outline-none focus:ring-0 leading-relaxed",
            mode === "code" ? "font-code text-sm" : "font-body text-base"
          )}
          spellCheck={false}
        />
        
        {/* Selection Tooltip (Simulated placeholder for complex UI feature) */}
        <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {mode === "code" ? `Language: ${language}` : "Context-Aware Editor Active"}
        </div>
      </div>
    </div>
  );
}
