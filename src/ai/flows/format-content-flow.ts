'use server';
/**
 * @fileOverview A Genkit flow for intelligent, context-aware formatting of code and text.
 * It handles SQL/PL/SQL beautification and professional prose optimization.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatContentInputSchema = z.object({
  content: z.string().describe('The content to format.'),
  language: z.string().describe('The language of the content (e.g., SQL, PL/SQL, Plain Text).'),
  mode: z.enum(['text', 'code']).describe('Whether the content is code or prose.'),
});
export type FormatContentInput = z.infer<typeof FormatContentInputSchema>;

const FormatContentOutputSchema = z.object({
  formattedContent: z.string().describe('The intelligently formatted and optimized content.'),
});
export type FormatContentOutput = z.infer<typeof FormatContentOutputSchema>;

export async function formatContent(input: FormatContentInput): Promise<FormatContentOutput> {
  return formatContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatContentPrompt',
  input: {schema: FormatContentInputSchema},
  output: {schema: FormatContentOutputSchema},
  prompt: `You are an expert software editor and database architect. 
Your goal is to format, beautify, and optimize the following content based on its detected language and purpose.

Language: {{{language}}}
Mode: {{{mode}}}

### Instructions:
1. If the mode is 'code' and language is SQL or PL/SQL:
   - Apply strict beautification: 2-space consistent indentation.
   - Force UPPERCASE for all SQL reserved keywords (e.g., SELECT, FROM, WHERE, BEGIN, END, EXCEPTION, COMMIT).
   - Align clauses (e.g., align all JOIN and WHERE conditions) for maximum vertical readability.
   - Ensure semicolons are correctly placed.
   - For PL/SQL: Ensure standard block structure (DECLARE, BEGIN, EXCEPTION, END;).
   - Remove redundant whitespace and fix broken formatting.

2. If the mode is 'text':
   - Correct all grammar, spelling, and punctuation.
   - Improve flow and clarity without losing the author's intent.
   - Use professional terminology where appropriate.
   - If the text looks like technical documentation or notes, use Markdown headers (#, ##) and bullet points to add structure.

3. Return ONLY the formatted content. Do not include any meta-commentary, explanations, or backticks around the result.

Content to Format:
"""
{{{content}}}
"""

Formatted Output:`,
});

const formatContentFlow = ai.defineFlow(
  {
    name: 'formatContentFlow',
    inputSchema: FormatContentInputSchema,
    outputSchema: FormatContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("Formatting failed.");
    return output;
  }
);
