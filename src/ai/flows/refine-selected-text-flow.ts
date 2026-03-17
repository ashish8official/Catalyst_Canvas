'use server';
/**
 * @fileOverview A Genkit flow for refining selected text based on a user prompt.
 *
 * - refineSelectedText - A function that refines selected text using an AI model.
 * - RefineSelectedTextInput - The input type for the refineSelectedText function.
 * - RefineSelectedTextOutput - The return type for the refineSelectedText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineSelectedTextInputSchema = z.object({
  selectedText: z.string().describe('The text selected by the user in the editor.'),
  refinementPrompt: z
    .string()
    .describe(
      'A natural language prompt from the user describing how to refine the selected text (e.g., "summarize this", "make this more concise").'
    ),
});
export type RefineSelectedTextInput = z.infer<typeof RefineSelectedTextInputSchema>;

const RefineSelectedTextOutputSchema = z.object({
  refinedText: z.string().describe('The AI-generated refined text.'),
});
export type RefineSelectedTextOutput = z.infer<typeof RefineSelectedTextOutputSchema>;

export async function refineSelectedText(input: RefineSelectedTextInput): Promise<RefineSelectedTextOutput> {
  return refineSelectedTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineSelectedTextPrompt',
  input: {schema: RefineSelectedTextInputSchema},
  output: {schema: RefineSelectedTextOutputSchema},
  prompt: `You are an AI assistant specialized in text refinement.

Your task is to refine the provided 'selectedText' based on the 'refinementPrompt' given by the user.
Ensure the output is only the refined text, without any conversational filler or extra explanations.

Refinement Prompt: "{{{refinementPrompt}}}"

Selected Text:
"""
{{{selectedText}}}
"""

Refined Text:`,
});

const refineSelectedTextFlow = ai.defineFlow(
  {
    name: 'refineSelectedTextFlow',
    inputSchema: RefineSelectedTextInputSchema,
    outputSchema: RefineSelectedTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
