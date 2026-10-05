import { hasOpenAI } from './env';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Chiama la Chat Completions API di OpenAI.
 * Restituisce `null` se la chiave non è configurata o la chiamata fallisce,
 * così i chiamanti possono ricadere sulla risposta demo.
 */
export async function chat({ system, user, json = false, temperature = 0.7, maxTokens = 600 }) {
  if (!hasOpenAI) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error('OpenAI error', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    return json ? JSON.parse(content) : content;
  } catch (err) {
    console.error('OpenAI request failed', err);
    return null;
  }
}
