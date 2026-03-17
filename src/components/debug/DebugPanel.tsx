"use client";

import React from "react";
import { Bug, AlertCircle, CheckCircle, ArrowRight, Zap, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
  onFixAll: () => void;
}

export function DebugPanel({ onFixAll }: DebugPanelProps) {
  const issues = [
    { 
      id: "err-1", 
      type: "Performance", 
      severity: "High", 
      message: "Potential full table scan in SELECT query. Missing index on 'created_at'.",
      icon: <Zap className="w-4 h-4 text-amber-500" />
    },
    { 
      id: "err-2", 
      type: "Security", 
      severity: "Critical", 
      message: "Procedure input not properly sanitized. Risk of SQL injection in parameter 'p_status'.",
      icon: <Terminal className="w-4 h-4 text-destructive" />
    },
    { 
      id: "err-3", 
      type: "Syntax", 
      severity: "Medium", 
      message: "Missing explicit COMMIT statement in transactional block.",
      icon: <Bug className="w-4 h-4 text-primary" />
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b bg-destructive/5">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-destructive" />
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">Diagnostics</span>
        </div>
        <Badge variant="destructive" className="h-5 text-[10px] px-2">{issues.length} Issues</Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="p-4 rounded-xl border border-white/5 bg-secondary/20 hover:bg-secondary/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {issue.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{issue.type}</span>
              </div>
              <Badge 
                className={cn(
                  "text-[9px] font-bold h-5 uppercase tracking-tighter",
                  issue.severity === "High" || issue.severity === "Critical" ? "bg-destructive/20 text-destructive border-destructive/20" : "bg-primary/20 text-primary border-primary/20"
                )}
                variant="outline"
              >
                {issue.severity}
              </Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors">
              {issue.message}
            </p>
            <div className="mt-4 flex justify-end">
               <Button variant="ghost" size="sm" className="h-7 gap-2 text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary">
                 Focus
                 <ArrowRight className="w-3 h-3" />
               </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-secondary/10">
        <Button 
          className="w-full h-10 gap-3 bg-destructive hover:bg-destructive/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-destructive/20"
          onClick={onFixAll}
        >
          <Sparkles className="w-4 h-4" />
          Ask AI to fix all
        </Button>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}