'use server';

/**
 * @fileOverview A flow to synthesize a spoken response from text using a natural-sounding voice.
 *
 * - synthesizeSpokenResponse - A function that synthesizes a spoken response.
 * - SynthesizeSpokenResponseInput - The input type for the synthesizeSpokenResponse function.
 * - SynthesizeSpokenResponseOutput - The return type for the synthesizeSpokenResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeSpokenResponseInputSchema = z.object({
  text: z
    .string()
    .describe('The text to be synthesized into a spoken response.'),
});
export type SynthesizeSpokenResponseInput = z.infer<
  typeof SynthesizeSpokenResponseInputSchema
>;

const SynthesizeSpokenResponseOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the synthesized spoken response, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // keep the backslashes in
    ),
});
export type SynthesizeSpokenResponseOutput = z.infer<
  typeof SynthesizeSpokenResponseOutputSchema
>;

export async function synthesizeSpokenResponse(
  input: SynthesizeSpokenResponseInput
): Promise<SynthesizeSpokenResponseOutput> {
  return synthesizeSpokenResponseFlow(input);
}

const synthesizeSpokenResponsePrompt = ai.definePrompt({
  name: 'synthesizeSpokenResponsePrompt',
  input: {schema: SynthesizeSpokenResponseInputSchema},
  output: {schema: SynthesizeSpokenResponseOutputSchema},
  prompt: `Synthesize the following text into a spoken response:

{{{text}}}`, // triple-braces to prevent HTML escaping
  config: {
    // Configure safety settings as needed, e.g., to allow potentially sensitive content
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const synthesizeSpokenResponseFlow = ai.defineFlow(
  {
    name: 'synthesizeSpokenResponseFlow',
    inputSchema: SynthesizeSpokenResponseInputSchema,
    outputSchema: SynthesizeSpokenResponseOutputSchema,
  },
  async input => {
    // Here you would integrate with a text-to-speech service.
    // Since we cannot directly implement the TTS service, the prompt will return a base64 encoded string.
    const {output} = await synthesizeSpokenResponsePrompt(input);
    return output!;
  }
);
