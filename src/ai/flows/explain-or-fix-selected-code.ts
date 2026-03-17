
'use server';
/**
 * @fileOverview A Genkit flow for explaining or suggesting fixes/improvements for a given code snippet.
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
      'The programming language of the code snippet.'
    ),
});
export type ExplainOrFixSelectedCodeInput = z.infer<
  typeof ExplainOrFixSelectedCodeInputSchema
>;

const ExplainOrFixSelectedCodeOutputSchema = z.object({
  explanationOrFix: z
    .string()
    .describe('The AI generated explanation or suggested fix/improvement.'),
});
export type ExplainOrFixSelectedCodeOutput = z.infer<
  typeof ExplainOrFixSelectedCodeOutputSchema
>;

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
  prompt: `You are an expert software engineer.

{{#if isExplain}}
Explain this code snippet concisely.
{{/if}}

{{#if isFix}}
Suggest fixes or improvements for this code.
{{/if}}

Language: {{{language}}}

Code:
\`\`\`
{{{codeSnippet}}}
\`\`\`
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
