
'use server';
/**
 * @fileOverview Pallet Sorter AI agent.
 *
 * - sortIntoPallets - A function that assigns cities to available pallets.
 * - PalletSorterInput - The input type for the sortIntoPallets function.
 * - PalletSorterOutput - The return type for the sortIntoPallets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PalletSorterInputSchema = z.object({
  cities: z.array(z.string()).describe('A list of unique city names that need to be assigned to pallets.'),
  palletNumbers: z.array(z.number()).describe('A list of available pallet numbers (e.g., 1 to 100).')
});
export type PalletSorterInput = z.infer<typeof PalletSorterInputSchema>;

const PalletSorterOutputSchema = z.object({
  assignments: z.record(z.string(), z.number()).describe('An object mapping each city to an assigned pallet number.'),
});
export type PalletSorterOutput = z.infer<typeof PalletSorterOutputSchema>;


export async function sortIntoPallets(input: PalletSorterInput): Promise<PalletSorterOutput> {
  return palletSorterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'palletSorterPrompt',
  input: {schema: PalletSorterInputSchema},
  output: {schema: PalletSorterOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are a logistics expert responsible for sorting boxes onto pallets. You will be given a list of unique destination cities from a manifest and a list of available pallet numbers.

Your task is to assign each city to one of the available pallet numbers. Ensure every city gets a pallet number. If there are more cities than pallets, you can assign multiple cities to the same pallet, but try to keep it one city per pallet if possible.

Cities to sort:
{{#each cities}}
- {{{this}}}
{{/each}}

Available Pallet Numbers: {{#each palletNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return the result as a JSON object where the keys are the city names and the values are the assigned pallet numbers.`,
});

const palletSorterFlow = ai.defineFlow(
  {
    name: 'palletSorterFlow',
    inputSchema: PalletSorterInputSchema,
    outputSchema: PalletSorterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
