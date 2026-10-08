import { env } from './env';

export function provider() {
  const p =
    (env as any).AI_PROVIDER ||
    ((env as any).GEMINI_API_KEY ? 'gemini' : 'openai');

  if (!['gemini', 'openai'].includes(p)) {
    throw new Error('AI_PROVIDER must be gemini or openai.');
  }

  return p;
}

export function aiReady() {
  return Boolean(
    provider() === 'gemini'
      ? (env as any).GEMINI_API_KEY
      : (env as any).OPENAI_API_KEY
  );
}

export const openAIExtrasReady = () =>
  Boolean((env as any).OPENAI_API_KEY);

export function geminiModel() {
  const name = (env as any).GEMINI_MODEL || 'gemini-3.8-flash';

  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error('Invalid Gemini model setting.');
  }

  return name;
}

export async function geminiRequest(body: any, timeout = 90000) {
  const key = (env as any).GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      'Set GEMINI_API_KEY in the backend environment variables.'
    );
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' +
      geminiModel() +
      ':generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json',
        'x-goog-api-client': 'learn-ai/1.1',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'Gemini model is unavailable for this API project. Check GEMINI_MODEL in Railway.'
      );
    }

    if (response.status === 429) {
      throw new Error(
        'Gemini quota or rate limit reached. Check your Google AI Studio limits and retry later.'
      );
    }

    if ([400, 401, 403].includes(response.status)) {
      throw new Error(
        `Gemini rejected the request (HTTP ${response.status}). Check the API key, model access and request settings.`
      );
    }

    throw new Error(
      `Gemini is unavailable (HTTP ${response.status}). Retry your input later.`
    );
  }

  return await response.json();
}

export function geminiText(data: any) {
  const candidate = data.candidates?.[0];

  if (
    data.promptFeedback?.blockReason ||
    !candidate ||
    candidate.finishReason !== 'STOP'
  ) {
    throw new Error(
      'Gemini returned blocked, incomplete or empty content. No result was saved.'
    );
  }

  const text = candidate.content?.parts
    ?.filter((part: any) => part.text && !part.thought)
    .map((part: any) => part.text)
    .join('');

  if (!text) {
    throw new Error('Gemini returned no usable text.');
  }

  return text;
}

export async function jsonCompletion(
  instructions: string,
  input: any,
  tokens = 1600,
  timeout = 40000
) {
  if (!aiReady()) {
    throw new Error('Connect the server AI service to use this feature.');
  }

  let text: string;

  if (provider() === 'gemini') {
    const model = geminiModel();

    // Gemini 2.5 uses a token budget; Gemini 3 uses thinking levels.
    const thinkingConfig = model.startsWith('gemini-2.5-')
      ? model.includes('pro')
        ? { thinkingBudget: 128 }
        : { thinkingBudget: 0 }
      : { thinkingLevel: 'low' };

    const data = await geminiRequest(
      {
        systemInstruction: {
          parts: [{ text: instructions }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(input) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: tokens,
          temperature: 0.3,
          thinkingConfig,
        },
      },
      timeout
    );

    text = geminiText(data);
  } else {
    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + (env as any).OPENAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: (env as any).OPENAI_MODEL || 'gpt-4.1-mini',
          instructions,
          input: JSON.stringify(input),
          text: { format: { type: 'json_object' } },
          store: false,
          max_output_tokens: tokens,
        }),
        signal: AbortSignal.timeout(timeout),
      }
    );

    if (!response.ok) {
      throw new Error(
        'AI request failed. Check server connection, billing or rate limits.'
      );
    }

    const data: any = await response.json();

    if (data.status && data.status !== 'completed') {
      throw new Error('AI response was incomplete.');
    }

    text = data.output
      ?.flatMap((output: any) => output.content || [])
      .filter((content: any) => content.type === 'output_text')
      .map((content: any) => content.text)
      .join('');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON. No learning result was saved.');
  }
}
