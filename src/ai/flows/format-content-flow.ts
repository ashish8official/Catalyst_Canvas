'use server';
/**
 * @fileOverview A Genkit flow for intelligent, context-aware formatting of code and text.
 * It handles SQL/PL/SQL beautification, Python optimization, and professional prose.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatContentInputSchema = z.object({
  content: z.string().describe('The content to format.'),
  language: z.string().describe('The language of the content (e.g., SQL, PL/SQL, Python, Plain Text).'),
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
  prompt: `You are an expert software editor and senior architect. 
Your goal is to format, beautify, and optimize the following content based on its detected language and purpose.

Language: {{{language}}}
Mode: {{{mode}}}

### Instructions:
1. If the mode is 'code' and language is SQL or PL/SQL:
   - Apply industry-standard beautification (compact yet readable).
   - Use 2-space consistent indentation.
   - Force UPPERCASE for all SQL reserved keywords (SELECT, FROM, WHERE, etc.).
   - Do NOT force every single column or parameter onto a new line if they fit reasonably on one. Only break lines for major clauses or long lists.
   - Ensure multiple queries are separated by exactly one blank line.
   - For PL/SQL: Maintain standard block structure (DECLARE, BEGIN, EXCEPTION, END;).

2. If the mode is 'code' and language is Python:
   - Apply PEP 8 style guidelines.
   - Ensure consistent 4-space indentation.
   - Use industry-standard line lengths and block separation.

3. If the mode is 'text':
   - Correct all grammar, spelling, and punctuation.
   - Improve flow and clarity while maintaining professional tone.
   - Use Markdown for structure (# headers, - bullets) if appropriate.

4. Return ONLY the formatted content. No conversational meta-commentary.

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
