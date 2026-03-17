
'use server';
/**
 * @fileOverview A Genkit flow for explaining or suggesting fixes/improvements for a given code snippet.
 *
 * - explainOrFixSelectedCode - A function that handles the explanation or fixing/improvement process.
 * - ExplainOrFixSelectedCodeInput - The input type for the explainOrFixSelectedCode function.
 * - ExplainOrFixSelectedCodeOutput - The return type for the explainOrFixSelectedCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainOrFixSelectedCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to explain or fix.'),
  action: z
    .enum(['explain', 'fix_or_improve'])
    .describe('The action to perform: explain the code or suggest fixes/improvements.'),
  language: z
    .string()
    .optional()
    .describe(
      'The programming language of the code snippet (e.g., "typescript", "java", "sql"). If not provided, the AI should try to infer it.'
    ),
});
export type ExplainOrFixSelectedCodeInput = z.infer<
  typeof ExplainOrFixSelectedCodeInputSchema
>;

const ExplainOrFixSelectedCodeOutputSchema = z.object({
  explanationOrFix: z
    .string()
    .describe('The AI generated explanation or suggested fix/improvement for the code snippet.'),
});
export type ExplainOrFixSelectedCodeOutput = z.infer<
  typeof ExplainOrFixSelectedCodeOutputSchema
>;

// Internal schema for the prompt including boolean flags for logic-less templates
const PromptInputSchema = ExplainOrFixSelectedCodeInputSchema.extend({
  isExplain: z.boolean(),
  isFix: z.boolean(),
});

export async function explainOrFixSelectedCode(
  input: ExplainOrFixSelectedCodeInput
): Promise<ExplainOrFixSelectedCodeOutput> {
  return explainOrFixSelectedCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainOrFixSelectedCodePrompt',
  input: {schema: PromptInputSchema},
  output: {schema: ExplainOrFixSelectedCodeOutputSchema},
  prompt: `You are an expert software engineer and code reviewer.

{{#if isExplain}}
Explain the following code snippet concisely and clearly. Focus on its purpose, how it works, and any key concepts or potential pitfalls.
{{/if}}

{{#if isFix}}
Analyze the following code snippet and suggest potential fixes or improvements. Focus on common issues, best practices, performance, security, and readability. Provide explanations for your suggestions.
{{/if}}

The code is written in {{{language}}} (if provided, otherwise infer the language).

Code:
\`\`\`
{{{codeSnippet}}}
\`\`\`

{{#if isExplain}}
Explanation:
{{/if}}

{{#if isFix}}
Suggestions/Improvements:
{{/if}}
`,
});

const explainOrFixSelectedCodeFlow = ai.defineFlow(
  {
    name: 'explainOrFixSelectedCodeFlow',
    inputSchema: ExplainOrFixSelectedCodeInputSchema,
    outputSchema: ExplainOrFixSelectedCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
      isExplain: input.action === 'explain',
      isFix: input.action === 'fix_or_improve',
    });
    return output!;
  }
);
