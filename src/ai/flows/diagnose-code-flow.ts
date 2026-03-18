'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiagnoseCodeInputSchema = z.object({
  content: z.string().describe('The code to diagnose.'),
  language: z.string().describe('Language context: SQL, PL/SQL, Python, etc.'),
});
export type DiagnoseCodeInput = z.infer<typeof DiagnoseCodeInputSchema>;

const DiagnosticIssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'info']),
  line: z.number().optional().describe('Approximate line number if identifiable.'),
  message: z.string().describe('Short description of the issue.'),
  suggestion: z.string().describe('Concrete fix or improvement suggestion.'),
});

const DiagnoseCodeOutputSchema = z.object({
  issues: z.array(DiagnosticIssueSchema).describe('List of detected issues.'),
  summary: z.string().describe('One-line overall assessment.'),
});
export type DiagnoseCodeOutput = z.infer<typeof DiagnoseCodeOutputSchema>;

export async function diagnoseCode(
  input: DiagnoseCodeInput
): Promise<DiagnoseCodeOutput> {
  return diagnoseCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCodePrompt',
  input: { schema: DiagnoseCodeInputSchema },
  output: { schema: DiagnoseCodeOutputSchema },
  prompt: `You are a senior database engineer and systems architect.

Analyze the following code and identify technical issues. 

For SQL and PL/SQL specifically, look for:
- Missing column aliases in complex joins.
- Potential full table scans (missing WHERE clauses on large tables).
- Implicit commits or lack of transaction control.
- Missing exception handling blocks in PL/SQL.
- Inefficient subqueries that could be JOINs.
- SQL injection vulnerabilities.

For other languages:
- Logic errors, performance bottlenecks, and security risks.

Return a list of issues with:
- severity: 'error' (breaks execution), 'warning' (bad practice/risk), or 'info' (style/suggestion).
- line: approximate line number.
- message: clear description.
- suggestion: how to fix it.

Also provide a one-sentence "summary" of the overall code health.

Code ({{language}}):
\`\`\`
{{{content}}}
\`\`\``,
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
