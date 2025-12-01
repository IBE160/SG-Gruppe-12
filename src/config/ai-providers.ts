// src/config/ai-providers.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

if (!GOOGLE_AI_API_KEY) {
  console.warn('GOOGLE_AI_API_KEY is not set. AI services may not function correctly.');
}

// Instantiate the Vercel AI SDK-compatible client
export const gemini = createGoogleGenerativeAI({
  apiKey: GOOGLE_AI_API_KEY,
});

// Placeholder for other Vercel AI SDK providers if they were to be used:
// export const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY!
// });
// export const anthropic = createAnthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!
// });
