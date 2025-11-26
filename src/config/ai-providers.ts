// src/config/ai-providers.ts
import { GoogleGenerativeAI } from '@google/generative-ai'; // Correct import for @google/generative-ai
// import { createGoogleGenerativeAI } from '@ai-sdk/google'; // Vercel AI SDK specific import, ensure you install @ai-sdk/google if needed
// import { createOpenAI } from '@ai-sdk/openai';
// import { createAnthropic } from '@ai-sdk/anthropic';

// For GoogleGenerativeAI, you instantiate it directly, not through createGoogleGenerativeAI from @ai-sdk/google
// If you intend to use @ai-sdk/google, you'd install it and use it as shown in the commented lines.
// For now, adhering to the basic @google/generative-ai library for simplicity as per common setup.

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

if (!GOOGLE_AI_API_KEY) {
  console.warn('GOOGLE_AI_API_KEY is not set. AI services may not function correctly.');
}

// Instantiate the Google Generative AI client
// This uses the core Google Generative AI library.
// If Vercel AI SDK is specifically required with its abstractions,
// then @ai-sdk/google would need to be installed and used instead.
export const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Placeholder for Vercel AI SDK if it were used:
// export const gemini = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_AI_API_KEY!
// });
// export const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY!
// });
// export const anthropic = createAnthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!
// });
