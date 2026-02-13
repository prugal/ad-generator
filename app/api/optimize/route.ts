import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { getDetailsString } from '../../../services/adHelpers';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(ai: GoogleGenAI, modelId: string, params: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: modelId,
        ...params
      });
    } catch (error: any) {
      const isRetryable = 
        error.status === 503 || 
        error.status === 429 || 
        error.message?.includes('503') || 
        error.message?.includes('overloaded');
      
      if (isRetryable && i < retries - 1) {
        const waitTime = 1000 * Math.pow(2, i); // 1s, 2s, 4s
        console.log(`Gemini API Error ${error.status}. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { currentText, category, data } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      return NextResponse.json(
        { error: 'API key configuration missing' },
        { status: 500 }
      );
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
      contents: prompt,
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
  } catch (error: any) {
    console.error("Gemini Optimization Error:", error);
    if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
        return NextResponse.json(
            { error: "Превышен лимит запросов. Пожалуйста, подождите минуту." },
            { status: 429 }
        );
    }
    if (error.message?.includes('503') || error.status === 503) {
        return NextResponse.json(
            { error: "Сервис временно перегружен (503). Мы пытались повторить запрос, но безуспешно. Попробуйте через минуту." },
            { status: 503 }
        );
    }
    return NextResponse.json(
        { error: `Не удалось оптимизировать объявление: ${error.message}` },
        { status: 500 }
    );
  }
}
