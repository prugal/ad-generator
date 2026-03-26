import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getDetailsString } from '../../../services/adHelpers';
import { checkRateLimit, validateReferer, logError, type SecurityContext } from '../../../services/serverSecurity';
import { generateJsonWithFallback, getProviderByName } from '@/services/llm';
import type { LlmProviderName } from '@/services/llm/types';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  const context: SecurityContext = { ip, referer, path: '/api/optimize' };

  // 1. Referer Check
  if (!validateReferer(referer, host)) {
    await logError(context, 'SECURITY_VIOLATION', 'Invalid Referer', { referer, host });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Rate Limit Check
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    await logError(context, 'RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', { limit: 10 });
    return NextResponse.json({ error: rateLimit.message }, { status: rateLimit.status });
  }

  try {
    const { currentText, category, data, modelId, llmProvider } = await req.json();

    const details = getDetailsString(category, data);

    const prompt = `
      Act as an expert SEO-marketer for Avito/Youla.

      Your Goal:
      Increase the search visibility of this ad by organically integrating high-frequency keywords.

      Input:
      1. Item Details: ${details}
      2. Current Ad Text: ${currentText}

      Task:
      1. Identify 5-8 relevant, high-traffic keywords for this specific item.
      2. Rewrite the "Current Ad Text" to include these keywords naturally.
      3. KEEP the original tone and Markdown structure.
      4. Return the result in JSON format.
    `;

    // Если указан конкретный провайдер, используем его
    let response;
    if (llmProvider) {
      const provider = getProviderByName(llmProvider as LlmProviderName);
      if (provider) {
        // Для Polza.ai добавляем явную инструкцию по формату JSON в промпт
        const isPolza = llmProvider === 'polza';
        const formatInstruction = isPolza
          ? '\n\nIMPORTANT: Return ONLY valid JSON in this exact format:\n{"rewrittenAd": "your ad text here", "keywords": ["keyword1", "keyword2"]}\nDo NOT wrap in markdown code blocks. Do NOT add any other text.'
          : '';

        response = await provider.generateJson({
          prompt: `${prompt}${formatInstruction}`,
          modelId,
          temperature: 0.7,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rewrittenAd: {
                type: Type.STRING,
                description: 'The rewritten ad text. Keep Markdown formatting.',
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'The list of keywords used.',
              },
            },
            required: ['rewrittenAd', 'keywords'],
          },
        });
      } else {
        throw new Error(`Unknown provider: ${llmProvider}`);
      }
    } else {
      // Используем fallback-механизм по умолчанию
      response = await generateJsonWithFallback({
        prompt,
        modelId,
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rewrittenAd: {
              type: Type.STRING,
              description: 'The rewritten ad text. Keep Markdown formatting.',
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'The list of keywords used.',
            },
          },
          required: ['rewrittenAd', 'keywords'],
        },
      });
    }

    if (response.text) {
      let result = JSON.parse(response.text);

      // Polza.ai может возвращать ответ в другом формате
      // Конвертируем в стандартный формат { rewrittenAd, keywords }
      if (result.ad && typeof result.ad === 'object') {
        result = {
          rewrittenAd: result.ad.body || result.ad.text || result.rewrittenAd || '',
          keywords: result.keywords || result.ad.keywords || []
        };
      }

      return NextResponse.json({
        adText: result.rewrittenAd,
        keywords: result.keywords || [],
        provider: response.provider,
      });
    } else {
      throw new Error('No text returned from provider');
    }
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; stack?: string };
    console.error("Optimization Error:", error);

    await logError(context, 'API_ERROR', err, { message: err.message });

    if (err.message?.includes('429') || err.status === 429 || err.message?.includes('quota')) {
      return NextResponse.json(
        { error: "Превышен лимит запросов. Пожалуйста, подождите минуту." },
        { status: 429 }
      );
    }
    if (err.message?.includes('503') || err.status === 503) {
      return NextResponse.json(
        { error: "Сервис временно перегружен (503). Мы пытались повторить запрос, но безуспешно. Попробуйте через минуту." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `Не удалось оптимизировать объявление: ${err.message}` },
      { status: 500 }
    );
  }
}
