import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {noop} from 'genkit/noop';

const geminiApiKey = process.env.GEMINI_API_KEY;

const plugins: Plugin<any, any>[] = [
  geminiApiKey ? googleAI({apiKey: geminiApiKey}) : noop('google-ai'),
];

export const ai = genkit({
  plugins: plugins,
  model: geminiApiKey ? 'googleai/gemini-2.0-flash' : undefined,
});
