'use server';
/**
 * @fileOverview Pincode lookup AI agent.
 *
 * - pincodeLookup - A function that returns city and state for a given Indian pincode.
 * - PincodeLookupInput - The input type for the pincodeLookup function.
 * - PincodeLookupOutput - The return type for the pincodeLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PincodeLookupInputSchema = z.object({
  pincode: z.string().describe('The 6-digit Indian postal index number (pincode).'),
});
export type PincodeLookupInput = z.infer<typeof PincodeLookupInputSchema>;

const PincodeLookupOutputSchema = z.object({
  city: z.string().describe('The primary city or post office name for the pincode.'),
  state: z.string().describe('The state in which the pincode is located.'),
});
export type PincodeLookupOutput = z.infer<typeof PincodeLookupOutputSchema>;

export async function pincodeLookup(input: PincodeLookupInput): Promise<PincodeLookupOutput> {
  return pincodeLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pincodeLookupPrompt',
  input: {schema: PincodeLookupInputSchema},
  output: {schema: PincodeLookupOutputSchema},
  prompt: `You are a helpful assistant that provides location information for Indian pincodes. Given the following pincode, return the main city and state associated with it.

Pincode: {{{pincode}}}

Respond with only the JSON object containing the city and state.`,
});

const pincodeLookupFlow = ai.defineFlow(
  {
    name: 'pincodeLookupFlow',
    inputSchema: PincodeLookupInputSchema,
    outputSchema: PincodeLookupOutputSchema,
  },
  async input => {
    // Basic validation for an Indian pincode
    if (!/^\d{6}$/.test(input.pincode)) {
      return { city: '', state: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
