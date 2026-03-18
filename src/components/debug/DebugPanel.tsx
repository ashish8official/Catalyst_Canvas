'use client';

import React, { useState } from 'react';
import { diagnoseCode, DiagnoseCodeOutput } from '@/ai/flows/diagnose-code-flow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Zap, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Activity,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebugPanelProps {
  content: string;
  language: string;
  onFixAll: () => void;
}

export function DebugPanel({ content, language, onFixAll }: DebugPanelProps) {
  const [issues, setIssues] = useState<DiagnoseCodeOutput['issues']>([]);
  const [summary, setSummary] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runDiagnosis = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setHasRun(true);
    try {
      const result = await diagnoseCode({ content, language });
      setIssues(result.issues);
      setSummary(result.summary);
      setScore(result.healthScore);
    } catch (e) {
      setSummary('Audit failed. Please retry.');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (s: number) => {
    if (s > 80) return 'text-[#34D399]';
    if (s > 50) return 'text-[#F59E0B]';
    return 'text-[#F87171]';
  };

  return (
    <div className="flex flex-col h-full bg-[#1C2028]">
      {/* Header */}
      <div className="p-6 border-b border-[#2A3149] flex items-center justify-between bg-[#222837]/30">
        <div className="flex items-center gap-3">
          <Bug className="w-4 h-4 text-[#F87171]" />
          <h2 className="font-headline font-bold text-sm tracking-[0.2em] uppercase">Diagnostics</h2>
        </div>
        <div className="flex gap-1">
          <Badge className="bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20 text-[9px]">{issues.filter(i => i.severity === 'error').length}</Badge>
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 text-[9px]">{issues.filter(i => i.severity === 'warning').length}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Health Score Ring */}
          {hasRun && !isLoading && score !== null && (
            <div className="flex flex-col items-center justify-center p-8 bg-[#15181D] rounded-[2rem] border border-[#2A3149] shadow-inner">
              <div className="relative w-24 h-24 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="#2A3149" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="40" fill="transparent" 
                    stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 * (1 - score / 100)}
                    className={cn("transition-all duration-1000", getScoreColor(score))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-2xl font-headline font-bold", getScoreColor(score))}>{score}</span>
                  <span className="text-[8px] font-bold text-[#4A5178] uppercase">Health</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8B93B0] text-center italic leading-relaxed">"{summary}"</p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={runDiagnosis}
            disabled={isLoading || !content.trim()}
            className="w-full h-12 gap-3 bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/20 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isLoading ? "Analyzing with Gemini..." : "Run AI Architecture Audit"}
          </Button>

          {/* Empty State */}
          {!hasRun && !isLoading && (
            <div className="py-20 flex flex-col items-center justify-center opacity-20 gap-4">
              <Activity className="w-12 h-12" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center px-10">Initiate deep scan for SQL anti-patterns & risks</p>
            </div>
          )}

          {/* Clean State */}
          {hasRun && !isLoading && issues.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-[#34D399]">
              <CheckCircle className="w-12 h-12" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Audit Clear: No issues found</p>
            </div>
          )}

          {/* Issues List */}
          <div className="space-y-4">
            {issues.map((issue, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border bg-[#15181D]/40 space-y-3 transition-all animate-in slide-in-from-right-5",
                issue.severity === 'error' ? 'border-[#F87171]/20' : issue.severity === 'warning' ? 'border-[#F59E0B]/20' : 'border-[#4775D1]/20'
              )} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <Badge className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2",
                    issue.severity === 'error' ? 'bg-[#F87171]/10 text-[#F87171]' : issue.severity === 'warning' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#4775D1]/10 text-[#4775D1]'
                  )}>
                    {issue.severity}
                  </Badge>
                  {issue.line && <span className="text-[9px] font-mono text-[#4A5178]">Line {issue.line}</span>}
                </div>
                <p className="text-[11px] font-bold text-[#E8ECF5] leading-relaxed">{issue.message}</p>
                <div className="flex gap-2 text-[10px] text-[#8B93B0] leading-relaxed">
                  <span className="text-[#B478EA] shrink-0">💡</span>
                  <p className="italic">{issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {issues.length > 0 && !isLoading && (
        <div className="p-6 border-t border-[#2A3149] bg-[#222837]/30">
          <Button 
            onClick={onFixAll} 
            className="w-full h-11 bg-[#B478EA] hover:bg-[#B478EA]/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#B478EA]/20"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" /> Apply AI Resolution
          </Button>
        </div>
      )}
    </div>
  );
}
