'use server';
/**
 * @fileOverview A Genkit flow for intelligent, context-aware formatting of code and text.
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
  prompt: `You are an expert editor and software architect. 
Your goal is to format and optimize the following content based on its language and type.

Language: {{{language}}}
Mode: {{{mode}}}

### Instructions:
1. If the mode is 'code' and language is SQL or PL/SQL:
   - Beautify the code with consistent indentation (2 spaces).
   - Uppercase all SQL keywords (e.g., SELECT, FROM, WHERE, BEGIN, COMMIT).
   - Align clauses for maximum readability.
   - Suggest minor improvements for performance or clarity (like adding column aliases).
   - Ensure PL/SQL blocks have proper BEGIN/END structure and exception handling placeholders if missing.

2. If the mode is 'text':
   - Correct all grammar, punctuation, and spelling errors.
   - Improve sentence flow and clarity.
   - Adjust the tone to be professional and concise.
   - Use Markdown for structure (bullet points, headers) if appropriate for the content length.

3. Return ONLY the formatted content. Do not include any explanations before or after the code/text.

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
