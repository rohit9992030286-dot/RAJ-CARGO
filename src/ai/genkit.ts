import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const geminiApiKey = process.env.GEMINI_API_KEY;

const plugins: Plugin<any, any>[] = [];
if (geminiApiKey) {
  plugins.push(googleAI({apiKey: geminiApiKey}));
}

export const ai = genkit({
  plugins: plugins,
  model: geminiApiKey ? 'googleai/gemini-2.0-flash' : undefined,
});
