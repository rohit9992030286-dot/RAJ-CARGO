
'use server';
/**
 * @fileOverview State Lookup AI agent.
 *
 * - stateLookup - A function that looks up the state for a given city.
 * - StateLookupInput - The input type for the stateLookup function.
 * - StateLookupOutput - The return type for the stateLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StateLookupInputSchema = z.object({
  city: z.string().describe('The city name to look up.'),
});
export type StateLookupInput = z.infer<typeof StateLookupInputSchema>;

const StateLookupOutputSchema = z.object({
  state: z.string().describe('The corresponding state for the city.'),
});
export type StateLookupOutput = z.infer<typeof StateLookupOutputSchema>;

export async function stateLookup(input: StateLookupInput): Promise<StateLookupOutput> {
  if (!ai.getConfig().model) {
    return { state: '' };
  }
  return stateLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stateLookupPrompt',
  input: {schema: StateLookupInputSchema},
  output: {schema: StateLookupOutputSchema},
  prompt: `You are a geography expert. Given a city in India, you will return the state it belongs to.

City: {{{city}}}

State:`,
});

const stateLookupFlow = ai.defineFlow(
  {
    name: 'stateLookupFlow',
    inputSchema: StateLookupInputSchema,
    outputSchema: StateLookupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
