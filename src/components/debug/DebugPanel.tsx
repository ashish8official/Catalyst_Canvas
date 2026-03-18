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
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebugPanelProps {
  content: string;
  language: string;
  onFixAll: () => void;
}

type Issue = DiagnoseCodeOutput['issues'][number];

const severityConfig = {
  error: { 
    icon: AlertCircle, 
    color: 'text-destructive', 
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    item: 'bg-destructive/5 border-destructive/10 hover:border-destructive/30'
  },
  warning: { 
    icon: AlertTriangle, 
    color: 'text-amber-500', 
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    item: 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30'
  },
  info: { 
    icon: Info, 
    color: 'text-blue-400', 
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    item: 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30'
  },
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
      setSummary('Diagnosis failed. Please check your connection and try again.');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-destructive/15 border border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Bug className="w-4 h-4 text-destructive" />
          </div>
          <h2 className="font-headline font-bold text-sm tracking-widest uppercase text-foreground">Diagnostics</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasRun && !isLoading && (
            <Badge variant="outline" className="text-[10px] font-mono border-white/10 uppercase px-2">
              {issues.length} Issues Found
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Main Action */}
          <Button
            onClick={runDiagnosis}
            disabled={isLoading || !content.trim()}
            className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] gap-3 bg-secondary/40 hover:bg-secondary/60 border border-white/5 rounded-2xl transition-all active:scale-95 group shadow-lg"
            variant="ghost"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Auditing Workspace...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                Run AI Architecture Audit
              </>
            )}
          </Button>

          {/* Initial State */}
          {!hasRun && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <div className="p-5 rounded-full bg-secondary/20 border border-white/5">
                <Activity className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center px-12 leading-loose">
                Initiate a deep scan to identify SQL anti-patterns and logic risks.
              </p>
            </div>
          )}

          {/* Summary Box */}
          {hasRun && !isLoading && summary && (
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-[11px] text-foreground/80 italic leading-relaxed shadow-inner">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold uppercase tracking-tighter not-italic">
                <Sparkles className="w-3 h-3" />
                Architect's Verdict
              </div>
              "{summary}"
            </div>
          )}

          {/* Empty State / Success */}
          {hasRun && !isLoading && issues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in zoom-in duration-500">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Audit Clear</p>
                <p className="text-[10px] text-muted-foreground px-10">No critical issues detected in the current context.</p>
              </div>
            </div>
          )}

          {/* Issues List */}
          <div className="space-y-3">
            {issues.map((issue, i) => {
              const cfg = severityConfig[issue.severity];
              const Icon = cfg.icon;
              return (
                <div 
                  key={i} 
                  className={cn(
                    'p-5 rounded-2xl border text-[11px] space-y-4 transition-all animate-in slide-in-from-right-5 duration-300', 
                    cfg.item
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn('h-5 text-[8px] font-bold uppercase tracking-widest border-none', cfg.badge)}>
                      <Icon className="w-2.5 h-2.5 mr-1.5" />
                      {issue.severity}
                    </Badge>
                    {issue.line && (
                      <span className="text-[10px] font-mono text-muted-foreground/40">Line {issue.line}</span>
                    )}
                  </div>
                  
                  <p className="text-foreground/90 leading-relaxed font-medium">{issue.message}</p>
                  
                  <div className="bg-background/40 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-tighter">
                      <ArrowRight className="w-3 h-3" />
                      AI Recommended Resolution
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">{issue.suggestion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Fix All */}
      {issues.length > 0 && !isLoading && (
        <div className="p-6 border-t bg-secondary/5 mt-auto">
          <Button 
            onClick={onFixAll} 
            className="w-full h-12 gap-3 bg-[#B478EA] hover:bg-[#B478EA]/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#B478EA]/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Apply AI Architecture Fixes
          </Button>
          <p className="text-[8px] text-center mt-3 text-muted-foreground uppercase tracking-widest opacity-40">
            Fixes will be queued and applied as a single operation
          </p>
        </div>
      )}
    </div>
  );
}
