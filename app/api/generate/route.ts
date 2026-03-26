import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getSystemInstruction, buildPrompt } from '../../../services/adHelpers';
import { checkRateLimit, validateReferer, logError, supabaseAdmin, type SecurityContext } from '../../../services/serverSecurity';
import { generateJsonWithFallback, getProviderByName } from '@/services/llm';
import type { LlmProviderName } from '@/services/llm/types';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  const context: SecurityContext = { ip, referer, path: '/api/generate' };

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
    const { category, tone, data, llmProvider } = await req.json();

    const promptText = buildPrompt(category, tone, data);
    let imageInput: { mimeType: string; data: string } | undefined;

    // Handle Image for Electronics and Clothing
    if (category === 'electronics' || category === 'clothing') {
      const imgData = (data as { image?: string }).image;
      if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
        const base64Data = imgData.split(',')[1];
        const mimeType = imgData.split(';')[0].split(':')[1];
        imageInput = { data: base64Data, mimeType };
      }
    }

    // Если указан конкретный провайдер, используем его
    let response;
    if (llmProvider) {
      const provider = getProviderByName(llmProvider as LlmProviderName);
      if (provider) {
        // Для Polza.ai добавляем явную инструкцию по формату JSON в промпт
        const isPolza = llmProvider === 'polza';
        const formatInstruction = isPolza
          ? '\n\nIMPORTANT: Return ONLY valid JSON in this exact format:\n{"adText": "your ad text here", "smartTip": "your tip here"}\nDo NOT wrap in markdown code blocks. Do NOT add any other text.'
          : '';

        response = await provider.generateJson({
          prompt: imageInput
            ? `${promptText}\n\n[System Note: An image is provided. Analyze it to add specific visual details to the description.]${formatInstruction}`
            : `${promptText}${formatInstruction}`,
          image: imageInput,
          systemInstruction: getSystemInstruction(),
          temperature: 0.8,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              adText: {
                type: Type.STRING,
                description: 'The full classified ad text with title in bold, body, and CTA. Use Markdown.',
              },
              smartTip: {
                type: Type.STRING,
                description:
                  'A short, expert tip (10-20 words) for the seller on how to improve their listing photos or process based on the item type. Russian language.',
              },
            },
            required: ['adText', 'smartTip'],
          },
        });
      } else {
        throw new Error(`Unknown provider: ${llmProvider}`);
      }
    } else {
      // Используем fallback-механизм по умолчанию
      response = await generateJsonWithFallback({
        prompt: imageInput
          ? `${promptText}\n\n[System Note: An image is provided. Analyze it to add specific visual details to the description.]`
          : promptText,
        image: imageInput,
        systemInstruction: getSystemInstruction(),
        temperature: 0.8,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adText: {
              type: Type.STRING,
              description: 'The full classified ad text with title in bold, body, and CTA. Use Markdown.',
            },
            smartTip: {
              type: Type.STRING,
              description:
                'A short, expert tip (10-20 words) for the seller on how to improve their listing photos or process based on the item type. Russian language.',
            },
          },
          required: ['adText', 'smartTip'],
        },
      });
    }

    if (response.text) {
      let result = JSON.parse(response.text);

      // Polza.ai может возвращать ответ в формате { ad: { title, body, smart_tip } }
      // Конвертируем в стандартный формат { adText, smartTip }
      if (result.ad && typeof result.ad === 'object') {
        const adBody = result.ad.body || result.ad.text || '';
        const adTitle = result.ad.title || '';
        const adTip = result.ad.smart_tip || result.ad.smartTip || result.smartTip || '';

        result = {
          adText: adTitle && adBody ? `${adTitle}\n\n${adBody}` : adBody,
          smartTip: adTip
        };
      }

      // Save to Supabase (non-blocking) - use admin client to bypass RLS
      const dataToSave = { ...data };
      if ((dataToSave as { image?: string }).image) {
        delete (dataToSave as { image?: string }).image;
      }

      supabaseAdmin.from('generated_ads').insert({
        category,
        input_data: dataToSave,
        output_text: result.adText,
        tone,
      }).then(({ error }: { error: unknown }) => {
        if (error) {
          console.error('Error saving to Supabase:', error);
          logError(context, 'DB_INSERT_ERROR', error, { table: 'generated_ads' });
        }
      });

      return NextResponse.json({ ...result, provider: response.provider });
    } else {
      throw new Error('No text returned from provider');
    }
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; stack?: string };

    // Log the full error
    await logError(context, 'API_ERROR', err, { message: err.message });

    if (err.message?.includes('429') || err.status === 429 || err.message?.includes('quota')) {
      return NextResponse.json(
        { error: "Превышен лимит запросов (Quota Exceeded). Пожалуйста, подождите минуту и попробуйте снова." },
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
      { error: `Не удалось сгенерировать объявление: ${err.message}` },
      { status: 500 }
    );
  }
}
