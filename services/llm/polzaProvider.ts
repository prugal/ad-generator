import type { LlmGenerateJsonRequest, LlmGenerateJsonResult, LlmProvider } from './types';

interface PolzaChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEFAULT_POLZA_BASE_URL = 'https://api.polza.ai/v1';

export class PolzaProvider implements LlmProvider {
  readonly name = 'polza' as const;

  async generateJson(request: LlmGenerateJsonRequest): Promise<LlmGenerateJsonResult> {
    const apiKey = process.env.POLZA_API_KEY;
    if (!apiKey) {
      throw new Error('POLZA_API_KEY is missing');
    }

    if (request.image) {
      throw new Error('Polza provider does not support image prompts in current adapter');
    }

    const baseUrl = process.env.POLZA_API_BASE_URL || DEFAULT_POLZA_BASE_URL;
    const model = request.modelId || process.env.POLZA_MODEL_ID || 'gpt-4o-mini';

    const payload = {
      model,
      temperature: request.temperature ?? 0.7,
      messages: [
        ...(request.systemInstruction
          ? [{ role: 'system', content: request.systemInstruction }]
          : []),
        {
          role: 'user',
          content: `${request.prompt}\n\nReturn valid JSON only.`,
        },
      ],
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const details = await response.text().catch(() => 'no details');
      throw new Error(`Polza request failed: ${response.status} ${details}`);
    }

    const data = (await response.json()) as PolzaChatResponse;
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('Polza returned empty response');
    }

    return {
      text,
      provider: this.name,
      model,
    };
  }
}
