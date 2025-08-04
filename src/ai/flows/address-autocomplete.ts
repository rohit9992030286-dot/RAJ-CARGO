// src/ai/flows/address-autocomplete.ts
'use server';
/**
 * @fileOverview Address Autocomplete AI agent.
 *
 * - addressAutocomplete - A function that handles the address autocomplete process.
 * - AddressAutocompleteInput - The input type for the addressAutocomplete function.
 * - AddressAutocompleteOutput - The return type for the addressAutocomplete function.
 */


import {z} from 'genkit';
import {ai} from '@/ai/genkit';

const AddressAutocompleteInputSchema = z.object({
  partialAddress: z.string().describe('The partial address entered by the user.'),
});
export type AddressAutocompleteInput = z.infer<typeof AddressAutocompleteInputSchema>;

const AddressAutocompleteOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of address suggestions.'),
});
export type AddressAutocompleteOutput = z.infer<typeof AddressAutocompleteOutputSchema>;

export async function addressAutocomplete(input: AddressAutocompleteInput): Promise<AddressAutocompleteOutput> {
  if (!ai.getConfig().model) {
    return { suggestions: [] };
  }
  return addressAutocompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'addressAutocompletePrompt',
  input: {schema: AddressAutocompleteInputSchema},
  output: {schema: AddressAutocompleteOutputSchema},
  prompt: `You are an address suggestion service. Given a partial address, you will return an array of possible complete addresses.

Partial Address: {{{partialAddress}}}

Suggestions:`,
});

const addressAutocompleteFlow = ai.defineFlow(
  {
    name: 'addressAutocompleteFlow',
    inputSchema: AddressAutocompleteInputSchema,
    outputSchema: AddressAutocompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
