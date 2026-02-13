import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { getSystemInstruction, buildPrompt } from '../../../services/adHelpers';
import { supabase } from '../../../services/supabase';

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
    const { category, tone, data } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      return NextResponse.json(
        { error: 'API key configuration missing' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-flash-latest'; // Verified available model
    
    const promptText = buildPrompt(category, tone, data);
    
    const parts: any[] = [{ text: promptText }];

    // Handle Image for Electronics and Clothing
    if (category === 'electronics' || category === 'clothing') {
        const imgData = (data as any).image;
        if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
             const base64Data = imgData.split(',')[1];
             const mimeType = imgData.split(';')[0].split(':')[1];
             
             parts.push({
                 inlineData: {
                     data: base64Data,
                     mimeType: mimeType
                 }
             });
             
             parts[0].text += "\n\n[System Note: An image is provided. Analyze it to add specific visual details to the description.]";
        }
    }

    const response = await generateWithRetry(ai, modelId, {
      contents: { parts },
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

      // Save to Supabase (non-blocking)
      const dataToSave = { ...data };
      // Remove large image data before saving to DB
      if (dataToSave.image) {
          delete (dataToSave as any).image;
      }

      supabase.from('generated_ads').insert({
        category,
        input_data: dataToSave,
        output_text: result.adText,
        tone
      }).then(({ error }) => {
        if (error) console.error('Error saving to Supabase:', error);
      });

      return NextResponse.json(result);
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
        return NextResponse.json(
            { error: "Превышен лимит запросов (Quota Exceeded). Пожалуйста, подождите минуту и попробуйте снова." },
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
        { error: `Не удалось сгенерировать объявление: ${error.message}` },
        { status: 500 }
    );
  }
}
