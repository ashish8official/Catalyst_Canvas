'use client';

import React, { useState } from 'react';
import { diagnoseCode, DiagnoseCodeOutput } from '@/ai/flows/diagnose-code-flow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, Zap, AlertTriangle, Info, AlertCircle, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugPanelProps {
  content: string;
  language: string;
  onFixAll: () => void;
}

type Issue = DiagnoseCodeOutput['issues'][number];

const severityConfig = {
  error:   { icon: AlertCircle,   color: 'text-destructive',       badge: 'destructive',  bg: 'bg-destructive/5 border-destructive/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500',        badge: 'outline',      bg: 'bg-yellow-500/5 border-yellow-500/20'   },
  info:    { icon: Info,          color: 'text-blue-400',          badge: 'outline',      bg: 'bg-blue-500/5 border-blue-500/20'       },
};

export function DebugPanel({ content, language, onFixAll }: DebugPanelProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState('');
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
    } catch (e) {
      setSummary('Diagnosis failed. Please try again.');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const errorCount   = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount    = issues.filter(i => i.severity === 'info').length;

  return (
    <div className="flex flex-col h-full bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b bg-secondary/20">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-destructive" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Diagnostics
          </span>
        </div>
        {hasRun && !isLoading && issues.length > 0 && (
          <div className="flex items-center gap-1.5">
            {errorCount > 0   && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">{errorCount}E</Badge>}
            {warningCount > 0 && <Badge variant="outline"     className="text-[10px] h-4 px-1.5 border-yellow-500/40 text-yellow-500">{warningCount}W</Badge>}
            {infoCount > 0    && <Badge variant="outline"     className="text-[10px] h-4 px-1.5 border-blue-400/40 text-blue-400">{infoCount}I</Badge>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Run button */}
        <Button
          onClick={runDiagnosis}
          disabled={isLoading || !content.trim()}
          className="w-full h-10 text-[10px] font-bold uppercase tracking-widest gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-xl transition-all active:scale-95"
          variant="ghost"
        >
          {isLoading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analysing with Gemini...</>
            : <><Zap className="w-3.5 h-3.5" />Run AI Diagnosis</>
          }
        </Button>

        {/* Summary */}
        {hasRun && !isLoading && summary && (
          <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-white/5 text-[11px] text-muted-foreground italic leading-relaxed">
            {summary}
          </div>
        )}

        {/* Empty state */}
        {hasRun && !isLoading && issues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-40">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center px-4">Workspace is stable. No critical issues detected.</p>
          </div>
        )}

        {/* Not run yet */}
        {!hasRun && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
            <Sparkles className="w-10 h-10 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center px-6 leading-loose">
              Initiate diagnostic scan to audit your {language} implementation.
            </p>
          </div>
        )}

        {/* Issues list */}
        <div className="space-y-2">
          {issues.map((issue, i) => {
            const cfg = severityConfig[issue.severity];
            const Icon = cfg.icon;
            return (
              <div key={i} className={cn('p-4 rounded-xl border text-[11px] space-y-2.5 transition-all hover:bg-opacity-10', cfg.bg)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', cfg.color)} />
                  <span className={cn('font-bold uppercase tracking-wider', cfg.color)}>
                    {issue.severity}
                  </span>
                  {issue.line && (
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto opacity-50">Line {issue.line}</span>
                  )}
                </div>
                <p className="text-foreground/90 leading-relaxed font-medium">{issue.message}</p>
                <div className="text-muted-foreground leading-relaxed border-t border-white/5 pt-2 flex gap-2">
                  <span className="text-primary font-bold">FIX:</span>
                  <span>{issue.suggestion}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fix All */}
      {issues.length > 0 && !isLoading && (
        <div className="p-4 border-t bg-secondary/10">
          <Button 
            onClick={onFixAll} 
            className="w-full h-10 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            Implement AI Resolution
          </Button>
        </div>
      )}
    </div>
  );
}
