
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Braces, 
  Save, 
  MoreHorizontal, 
  Database, 
  Trash2, 
  Edit2, 
  Plus, 
  Terminal,
  Check,
  X,
  FileCode,
  FileJson,
  Hash
} from "lucide-react";
import { SelectionActionBar } from "./SelectionActionBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DocStats {
  words: number;
  chars: number;
  lines: number;
}

interface EditorSurfaceProps {
  fileName: string;
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: string) => void;
  onStatsChange?: (stats: DocStats) => void;
  mode: "text" | "code";
  language: string;
  wordWrap: boolean;
  onRefine: (prompt?: string) => void;
  onFormat: () => void;
  onAIAction: (action: 'explain' | 'fix' | 'format' | 'optimize' | 'summarize') => void;
  onSave: () => void;
  onSaveAs: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onNewFile: () => void;
}

export function EditorSurface({
  fileName,
  content,
  onChange,
  onSelectionChange,
  onStatsChange,
  mode,
  language,
  wordWrap,
  onRefine,
  onFormat,
  onAIAction,
  onSave,
  onSaveAs,
  onRename,
  onDelete,
  onNewFile,
}: EditorSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSelectionBar, setShowSelectionBar] = useState(false);
  const [barPosition, setBarPosition] = useState({ top: 0, left: 0 });
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(fileName);

  // Compute stats and bubble up
  const stats = useMemo(() => {
    const text = content || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split("\n").length;
    return { words, chars, lines };
  }, [content]);

  useEffect(() => {
    onStatsChange?.(stats);
  }, [stats, onStatsChange]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setEditName(fileName);
  }, [fileName]);

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
        // Find selection coordinates for floating action bar
        // We use a simplified positioning for standard textarea
        const { clientX, clientY } = (e as React.MouseEvent);
        if (clientX && clientY) {
          setBarPosition({ top: clientY - 50, left: clientX });
          setShowSelectionBar(true);
        }
      } else {
        setShowSelectionBar(false);
      }
    }
  };

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== fileName) {
      onRename(editName);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setEditName(fileName);
      setIsRenaming(false);
    }
  };

  const getFileIcon = () => {
    if (language === "SQL" || language === "PL/SQL") return <Database className="w-3.5 h-3.5 text-[#4775D1]" />;
    if (language === "Python") return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    if (language === "JSON") return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    if (language === "Markdown") return <Hash className="w-3.5 h-3.5 text-[#B478EA]" />;
    return <FileText className="w-3.5 h-3.5 text-primary" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#15181D]/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-[#B478EA]/20">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-secondary/20 border-b border-white/5">
        <div className="flex items-center gap-3">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                className="h-7 w-48 bg-background border-[#B478EA]/40 text-xs py-0 px-2"
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-500" onClick={handleRenameSubmit}><Check className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setIsRenaming(false)}><X className="w-3 h-3" /></Button>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-white/10 cursor-pointer hover:border-[#B478EA]/40 transition-colors group"
              onClick={() => setIsRenaming(true)}
            >
              {getFileIcon()}
              <span className="text-xs font-bold tracking-wide text-foreground/90">{fileName}</span>
              <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 ml-2" onClick={onNewFile}>
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New File</TooltipContent>
          </Tooltip>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{language} Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" size="sm" 
                className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                onClick={onFormat}
              >
                <Braces className="w-3.5 h-3.5" />
                AI Format
              </Button>
            </TooltipTrigger>
            <TooltipContent>Format Code</TooltipContent>
          </Tooltip>

          <Button 
            size="sm" 
            className="h-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase px-4 shadow-lg shadow-primary/20 transition-all active:scale-95"
            onClick={onSave}
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary/60">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-[#B478EA]/20">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={onSaveAs} className="gap-2 text-xs py-2 cursor-pointer">
                Save As / Clone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRenaming(true)} className="gap-2 text-xs py-2 cursor-pointer">
                Rename File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:text-destructive">
                Delete File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="relative flex-1 bg-background/40 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 bg-secondary/10 border-r border-white/5 py-8 text-right pr-3 select-none flex flex-col font-code text-[11px] text-muted-foreground/30 leading-relaxed">
          {Array.from({ length: Math.max(stats.lines, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="flex-1 relative group overflow-auto">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onMouseUp={handleSelection}
            onKeyUp={handleSelection}
            placeholder={mode === "code" ? "-- Start coding..." : "Start writing..."}
            className={cn(
              "w-full h-full p-8 bg-transparent resize-none focus:outline-none focus:ring-0 leading-relaxed caret-primary transition-all font-code text-[13px]",
              wordWrap ? "whitespace-pre-wrap" : "whitespace-pre",
              language === "SQL" || language === "PL/SQL" ? "text-[#4775D1]" : "text-foreground"
            )}
            spellCheck={false}
          />
          
          <div className="absolute bottom-6 right-8 flex items-center gap-4 text-[9px] text-muted-foreground/40 font-bold tracking-widest uppercase pointer-events-none group-hover:text-[#B478EA]/40 transition-colors">
            <span>{language}</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Ln {stats.lines}, Col {content.length}</span>
          </div>
        </div>
      </div>

      {/* Selection Action Bar - Floating above selection */}
      {showSelectionBar && (
        <SelectionActionBar 
          position={barPosition} 
          onAction={(type) => {
            if (['explain', 'fix', 'optimize', 'summarize'].includes(type)) {
              onAIAction(type as any);
            } else {
              onRefine(type);
            }
          }}
          onClose={() => setShowSelectionBar(false)}
        />
      )}
    </div>
  );
}
