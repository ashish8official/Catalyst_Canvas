'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiagnoseCodeInputSchema = z.object({
  content: z.string().describe('The code to diagnose.'),
  language: z.string().describe('Language: SQL, PL/SQL, Python, or Plain Text.'),
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
  prompt: `You are a senior database engineer and systems architect specializing in {{language}}.

Analyze the following code and identify issues. For each issue provide:
- severity: 'error' (breaks execution), 'warning' (bad practice/performance risk), or 'info' (style/suggestion)
- line: approximate line number if identifiable (optional)
- message: short description of the problem
- suggestion: concrete, actionable fix

Focus on:
- SQL/PL/SQL: missing aliases, full table scans, missing exception handling, implicit commits, unindexed WHERE columns, missing NULL checks.
- Python: PEP 8 violations, inefficient loops, mutable default arguments, missing error handling, type hint suggestions.
- Text: clarity, structure, completeness.

Return a summary of the overall code health in one sentence.

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
