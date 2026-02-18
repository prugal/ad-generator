import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, type GenerateContentParameters } from "@google/genai";
import { getDetailsString } from '../../../services/adHelpers';
import { checkRateLimit, validateReferer, logError, type SecurityContext } from '../../../services/serverSecurity';

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
    const { currentText, category, data } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      const err = new Error('API key configuration missing');
      await logError(context, 'CONFIG_ERROR', err);
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-flash-latest';

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

    const response = await generateWithRetry(ai, modelId, {
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rewrittenAd: {
              type: Type.STRING,
              description: "The rewritten ad text. Keep Markdown formatting.",
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of keywords used.",
            },
          },
          required: ["rewrittenAd", "keywords"],
        },
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return NextResponse.json({
        adText: result.rewrittenAd,
        keywords: result.keywords || []
      });
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; stack?: string };
    console.error("Gemini Optimization Error:", error);

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
