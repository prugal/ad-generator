import { GoogleGenAI, Type, type GenerateContentParameters, type Part } from '@google/genai';
import type { LlmGenerateJsonRequest, LlmGenerateJsonResult, LlmProvider } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(
  ai: GoogleGenAI,
  modelId: string,
  params: Omit<GenerateContentParameters, 'model'>,
  retries = 3,
) {
  for (let i = 0; i < retries; i += 1) {
    try {
      return await ai.models.generateContent({ model: modelId, ...params } as GenerateContentParameters);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const isRetryable =
        err.status === 503 ||
        err.status === 429 ||
        err.message?.includes('503') ||
        err.message?.includes('429') ||
        err.message?.toLowerCase().includes('overloaded');

      if (isRetryable && i < retries - 1) {
        const waitTime = 1000 * Math.pow(2, i);
        await delay(waitTime);
        continue;
      }

      throw error;
    }
  }

  throw new Error('Gemini generation failed after retries');
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini' as const;

  async generateJson(request: LlmGenerateJsonRequest): Promise<LlmGenerateJsonResult> {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      throw new Error('Gemini API key is missing');
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = request.modelId || process.env.GEMINI_MODEL_ID || 'gemini-3-flash-preview';

    const parts: Part[] = [{ text: request.prompt }];
    if (request.image) {
      parts.push({
        inlineData: {
          mimeType: request.image.mimeType,
          data: request.image.data,
        },
      });
    }

    const response = await generateWithRetry(ai, model, {
      contents: { role: 'user', parts },
      config: {
        systemInstruction: request.systemInstruction,
        temperature: request.temperature ?? 0.7,
        responseMimeType: 'application/json',
        responseSchema: request.responseSchema as { type: Type },
      },
    });

    if (!response.text) {
      throw new Error('Gemini returned empty response');
    }

    return {
      text: response.text,
      provider: this.name,
      model,
    };
  }
}
