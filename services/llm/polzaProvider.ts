import type { LlmGenerateJsonRequest, LlmGenerateJsonResult, LlmProvider } from './types';

interface PolzaChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface PolzaProviderSelection {
  order?: string[];
  only?: string[];
  ignore?: string[];
  sort?: 'price' | 'latency' | 'throughput';
  max_price?: {
    prompt?: number;
    completion?: number;
    image?: number;
    audio?: number;
    request?: number;
  };
  allow_fallbacks?: boolean;
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

    // Автоматический выбор провайдера (по умолчанию)
    // Polza.ai сам выбирает оптимального провайдера по цене, доступности и скорости
    const providerSelection: PolzaProviderSelection = {
      allow_fallbacks: true,
    };

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
      // @ts-ignore - расширенный параметр Polza.ai для выбора провайдера
      provider: providerSelection,
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
    let text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error('Polza returned empty response');
    }

    // Очищаем markdown-обёрку (```json ... ```) если она есть
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    return {
      text,
      provider: this.name,
      model,
    };
  }
}
