'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileCode, 
  FileText, 
  Plus, 
  X, 
  Braces, 
  Save, 
  Database,
  Terminal,
  Cpu,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { SelectionActionBar } from './SelectionActionBar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorSurfaceProps {
  files: any[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
  onFileClose: (id: string) => void;
  onNewFile: () => void;
  onFileNameChange: (id: string, newName: string) => void;
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: string) => void;
  onStatsChange: (stats: any) => void;
  onAIAction: (action: any) => void;
  onFormat: () => void;
  onRefine: (prompt?: string) => void;
  settings?: {
    textColor: string;
    fontSize: number;
    fontFamily: string;
  };
}

export function EditorSurface({
  files,
  activeFileId,
  onFileSelect,
  onFileClose,
  onNewFile,
  onFileNameChange,
  content,
  onChange,
  onSelectionChange,
  onStatsChange,
  onAIAction,
  onFormat,
  onRefine,
  settings
}: EditorSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showActionBar, setShowActionBar] = useState(false);
  const [barPosition, setBarPosition] = useState({ top: 0, left: 0 });
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  
  // Renaming State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId]);

  // Compute document stats
  const stats = useMemo(() => {
    const text = content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    return { words, chars, lines, ...cursorPos };
  }, [content, cursorPos]);

  useEffect(() => {
    onStatsChange(stats);
  }, [stats, onStatsChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const updateCursorPos = () => {
    if (!textareaRef.current) return;
    const textBefore = textareaRef.current.value.substring(0, textareaRef.current.selectionStart);
    const lines = textBefore.split('\n');
    setCursorPos({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const handleInteraction = (e: any) => {
    updateCursorPos();
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = textareaRef.current.value.substring(start, end);
    onSelectionChange(selectedText);

    if (selectedText.trim()) {
      const rect = textareaRef.current.getBoundingClientRect();
      
      setBarPosition({ 
        top: rect.top + 60, 
        left: rect.left + rect.width / 2 
      });
      setShowActionBar(true);
    } else {
      setShowActionBar(false);
    }
  };

  const getLangBadge = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'sql') return { label: 'SQL', color: 'bg-[#4775D1]/20 text-[#4775D1] border-[#4775D1]/30' };
    if (ext === 'plsql') return { label: 'PL/SQL', color: 'bg-[#B478EA]/20 text-[#B478EA] border-[#B478EA]/30' };
    if (ext === 'py') return { label: 'Python', color: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30' };
    return { label: 'Text', color: 'bg-[#4A5178]/20 text-[#8B93B0] border-[#4A5178]/30' };
  };

  const badge = getLangBadge(activeFile?.name || 'file.txt');

  const startRenaming = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const finishRenaming = () => {
    if (editingId && editName.trim()) {
      onFileNameChange(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#15181D]">
      {/* Tab Bar */}
      <div className="flex items-center h-10 bg-[#1C2028] border-b border-[#2A3149] px-2 overflow-x-auto no-scrollbar">
        {files.map(f => (
          <div 
            key={f.id}
            className={cn(
              "flex items-center h-full px-4 gap-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer border-r border-[#2A3149] transition-all relative group shrink-0",
              activeFileId === f.id ? "bg-[#15181D] text-[#E8ECF5]" : "text-[#4A5178] hover:bg-[#222837] hover:text-[#8B93B0]"
            )}
            onClick={() => onFileSelect(f.id)}
            onDoubleClick={() => startRenaming(f.id, f.name)}
          >
            {f.mode === 'code' ? <FileCode className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            
            {editingId === f.id ? (
              <input
                autoFocus
                className="bg-[#222837] border border-[#4775D1] rounded px-1.5 py-0.5 outline-none text-[#E8ECF5] w-32 lowercase"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={finishRenaming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRenaming();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate max-w-[120px]">{f.name}</span>
            )}

            {files.length > 1 && (
              <X 
                className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-[#F87171] transition-opacity ml-2" 
                onClick={(e) => { e.stopPropagation(); onFileClose(f.id); }} 
              />
            )}
            {activeFileId === f.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4775D1]" />}
          </div>
        ))}
        <Button variant="ghost" size="icon" className="h-full w-10 text-[#4A5178] hover:text-[#4775D1]" onClick={onNewFile}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Toolbar Row */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#1C2028]/40 border-b border-[#2A3149]">
        <div className="flex items-center gap-6">
          <div className={cn("px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] border", badge.color)}>
            {badge.label}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#4A5178] uppercase font-bold">
            <span>LN {stats.ln} : COL {stats.col}</span>
            <span className="w-px h-3 bg-[#2A3149]" />
            <span>{stats.words} WORDS</span>
            <span className="w-px h-3 bg-[#2A3149]" />
            <span>{stats.chars} CHARS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={onFormat}
            className="h-8 gap-2 bg-[#B478EA]/10 text-[#B478EA] border border-[#B478EA]/20 hover:bg-[#B478EA]/20 text-[10px] font-bold uppercase tracking-widest px-4 rounded-lg"
          >
            <Braces className="w-3.5 h-3.5" />
            AI Format
          </Button>
          <Button 
            className="h-8 gap-2 bg-[#4775D1] text-white hover:bg-[#4775D1]/90 text-[10px] font-bold uppercase tracking-widest px-4 rounded-lg shadow-lg shadow-[#4775D1]/20"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5178]"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Line Number Gutter */}
        <div className="w-12 bg-[#1C2028]/20 border-r border-[#2A3149] py-8 text-right pr-4 select-none font-mono text-[11px] text-[#4A5178] leading-relaxed">
          {Array.from({ length: Math.max(stats.lines, 1) }).map((_, i) => (
            <div key={i} className={cn(cursorPos.ln === i + 1 && "text-[#4775D1]")}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onMouseUp={handleInteraction}
          onKeyUp={handleInteraction}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowActionBar(false);
          }}
          style={{ 
            color: settings?.textColor || '#E8ECF5',
            fontSize: `${settings?.fontSize || 14}px`,
            fontFamily: settings?.fontFamily || 'JetBrains Mono, monospace'
          }}
          className={cn(
            "flex-1 bg-transparent p-8 resize-none focus:outline-none leading-relaxed caret-[#4775D1] placeholder-[#4A5178]",
            badge.label === 'Text' ? 'whitespace-pre-wrap' : 'whitespace-pre'
          )}
          spellCheck={false}
          placeholder={badge.label === 'Text' ? "Start writing..." : "-- Start coding..."}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#13161B] border-t border-[#2A3149] px-4 flex items-center justify-between text-[10px] font-mono text-[#4A5178] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[#4775D1]" />
            <span>{badge.label}</span>
          </div>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#B478EA]">
            <Cpu className="w-3 h-3" />
            <span>Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>Workspace Active</span>
          </div>
        </div>
      </div>

      {showActionBar && (
        <SelectionActionBar 
          position={barPosition} 
          onAction={(type) => {
            if (['explain', 'fix', 'optimize', 'summarize'].includes(type)) {
              onAIAction(type as any);
            } else {
              onRefine(type);
            }
          }}
          onClose={() => setShowActionBar(false)}
        />
      )}
    </div>
  );
}
