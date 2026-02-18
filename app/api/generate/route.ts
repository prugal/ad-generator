import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, type GenerateContentParameters, type Part } from "@google/genai";
import { getSystemInstruction, buildPrompt } from '../../../services/adHelpers';
import { supabase } from '../../../services/supabase';
import { checkRateLimit, validateReferer, logError, supabaseAdmin, type SecurityContext } from '../../../services/serverSecurity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(ai: GoogleGenAI, modelId: string, params: Omit<GenerateContentParameters, 'model'>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: modelId,
        ...params
      } as GenerateContentParameters);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const isRetryable =
        err.status === 503 ||
        err.status === 429 ||
        err.message?.includes('503') ||
        err.message?.includes('overloaded');

      if (isRetryable && i < retries - 1) {
        const waitTime = 1000 * Math.pow(2, i); // 1s, 2s, 4s
        console.log(`Gemini API Error ${err.status}. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content after retries");
}

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
    const { category, tone, data } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      const err = new Error('API key configuration missing');
      await logError(context, 'CONFIG_ERROR', err);
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-flash-latest';

    const promptText = buildPrompt(category, tone, data);

    const parts: Part[] = [{ text: promptText }];

    // Handle Image for Electronics and Clothing
    if (category === 'electronics' || category === 'clothing') {
      const imgData = (data as { image?: string }).image;
      if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
        const base64Data = imgData.split(',')[1];
        const mimeType = imgData.split(';')[0].split(':')[1];

        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });

        if (parts[0].text) {
          parts[0].text += "\n\n[System Note: An image is provided. Analyze it to add specific visual details to the description.]";
        }
      }
    }

    const response = await generateWithRetry(ai, modelId, {
      contents: { role: 'user', parts },
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adText: {
              type: Type.STRING,
              description: "The full classified ad text with title in bold, body, and CTA. Use Markdown.",
            },
            smartTip: {
              type: Type.STRING,
              description: "A short, expert tip (10-20 words) for the seller on how to improve their listing photos or process based on the item type. Russian language.",
            },
          },
          required: ["adText", "smartTip"],
        },
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);

      // Save to Supabase (non-blocking) - use admin client to bypass RLS
      const dataToSave = { ...data };
      if ((dataToSave as { image?: string }).image) {
        delete (dataToSave as { image?: string }).image;
      }

      supabaseAdmin.from('generated_ads').insert({
        category,
        input_data: dataToSave,
        output_text: result.adText,
        tone
      }).then(({ error }: { error: any }) => {
        if (error) {
          console.error('Error saving to Supabase:', error);
          logError(context, 'DB_INSERT_ERROR', error, { table: 'generated_ads' });
        }
      });

      return NextResponse.json(result);
    } else {
      throw new Error("No text returned from Gemini");
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
