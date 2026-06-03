type GeminiPart = { text: string };

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string };
};

export async function generateWithGemini(prompt: string, temperature = 0.8) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in Render Environment Variables.');
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature }
      })
    }
  );

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;

  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini API request failed with status ${res.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n').trim();
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}
