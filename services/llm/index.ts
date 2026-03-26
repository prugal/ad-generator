import { GeminiProvider } from './geminiProvider';
import { PolzaProvider } from './polzaProvider';
import type { LlmGenerateJsonRequest, LlmGenerateJsonResult, LlmProvider, LlmProviderName } from './types';

const providers: Record<LlmProviderName, LlmProvider> = {
  gemini: new GeminiProvider(),
  polza: new PolzaProvider(),
};

export function getProviderByName(name: LlmProviderName): LlmProvider | null {
  return providers[name] || null;
}

function parseProviderName(value: string | undefined, fallback: LlmProviderName): LlmProviderName {
  if (value === 'gemini' || value === 'polza') {
    return value;
  }
  return fallback;
}

export function getConfiguredProviders(): { primary: LlmProviderName; fallback: LlmProviderName | null } {
  const primary = parseProviderName(process.env.LLM_PRIMARY_PROVIDER, 'gemini');
  const fallback = parseProviderName(process.env.LLM_FALLBACK_PROVIDER, 'gemini');

  return {
    primary,
    fallback: fallback === primary ? null : fallback,
  };
}

export async function generateJsonWithFallback(request: LlmGenerateJsonRequest): Promise<LlmGenerateJsonResult> {
  const { primary, fallback } = getConfiguredProviders();

  try {
    return await providers[primary].generateJson(request);
  } catch (primaryError) {
    if (!fallback) {
      throw primaryError;
    }

    try {
      return await providers[fallback].generateJson(request);
    } catch (fallbackError) {
      const primaryMessage = primaryError instanceof Error ? primaryError.message : String(primaryError);
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new Error(`Both providers failed. Primary (${primary}): ${primaryMessage}. Fallback (${fallback}): ${fallbackMessage}`);
    }
  }
}
