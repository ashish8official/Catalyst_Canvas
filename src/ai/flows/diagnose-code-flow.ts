'use server';
/**
 * @fileOverview A professional code diagnostic flow for SQL, PL/SQL, and Python.
 * Detects anti-patterns, performance risks, and logic errors using Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiagnoseCodeInputSchema = z.object({
  content: z.string().describe('The code or text content to analyze.'),
  language: z.string().describe('The detected language context (SQL, PL/SQL, Python, etc.).'),
});

const DiagnosticIssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'info']),
  line: z.number().optional().describe('The approximate line number of the issue.'),
  message: z.string().describe('Clear description of the issue.'),
  suggestion: z.string().describe('Actionable suggestion to fix the issue.'),
});

const DiagnoseCodeOutputSchema = z.object({
  issues: z.array(DiagnosticIssueSchema),
  summary: z.string().describe('A one-sentence overall assessment.'),
  healthScore: z.number().min(0).max(100).describe('A score from 0-100 reflecting code quality.'),
});

export type DiagnoseCodeInput = z.infer<typeof DiagnoseCodeInputSchema>;
export type DiagnoseCodeOutput = z.infer<typeof DiagnoseCodeOutputSchema>;

export async function diagnoseCode(input: DiagnoseCodeInput): Promise<DiagnoseCodeOutput> {
  return diagnoseCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCodePrompt',
  input: { schema: DiagnoseCodeInputSchema },
  output: { schema: DiagnoseCodeOutputSchema },
  prompt: `You are a world-class systems architect and database administrator.
Analyze the following {{language}} code for architectural flaws, performance bottlenecks, and security risks.

### Specifically for SQL/PL/SQL:
- Identify missing column aliases in joins.
- Flag potential full table scans (missing indexes or WHERE clauses).
- Detect implicit commits or lack of transaction control.
- Check for missing exception handling blocks.
- Identify SQL injection vulnerabilities.
- Flag inefficient subqueries.

### For Python/General:
- Detect PEP 8 violations and logic bugs.
- Identify performance bottlenecks and unsafe operations.

Provide a list of issues, a summary sentence, and a health score (0-100).

Code:
"""
{{{content}}}
"""`,
});

const diagnoseCodeFlow = ai.defineFlow(
  {
    name: 'diagnoseCodeFlow',
    inputSchema: DiagnoseCodeInputSchema,
    outputSchema: DiagnoseCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Diagnosis failed.');
    return output;
  }
);
