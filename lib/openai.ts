import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || 'missing-key-for-build';

export const openai = new OpenAI({ apiKey });

export function getOpenAI() {
  return openai;
}
