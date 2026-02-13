
import { GoogleGenAI, Type } from "@google/genai";
import { CategoryId, Tone, FormData, ElectronicsData, AutoData, ServicesData, ClothingData } from "../types";

const getSystemInstruction = () => {
  return `Act as a top-tier professional copywriter specializing in Russian classifieds (Avito, Youla). 
Your task is to write high-converting ad copy AND provide a smart, actionable tip to help the user sell faster.

**CRITICAL GUIDELINES FOR AD TEXT:**
1. **Format**: Use valid Markdown. Use **bold** for the title and key features. Use bullet points (-) for lists.
2. **Structure**: Hook -> Body (Benefits > Features) -> Details (Bulleted list) -> Reason for selling -> CTA.
3. **Language**: Natural, spoken Russian. Avoid "robot" phrases.
4. **Tone**: Adapt strictly to the requested tone.

**CRITICAL GUIDELINES FOR SMART TIP:**
Provide a short, specific piece of advice (1 sentence) based on the item category and condition.
- **Auto**: Suggest photos of documents, specific angles, or mentioning maintenance history.
- **Electronics**: Suggest showing battery health, specific ports, or serial number.
- **Clothing**: Suggest photos of tags, material close-ups, or fit details.
- **Services**: Suggest adding a portfolio link or offering a free consultation.
Example: "Сфотографируйте бирку с составом ткани — это снимает 30% вопросов покупателей."`;
};

const getDetailsString = (category: CategoryId, data: FormData): string => {
  const priceInfo = (data as any).price ? `Price: ${(data as any).price}` : '';

  switch (category) {
    case 'electronics':
      const elData = data as ElectronicsData;
      return `
        Category: Electronics
        Model: ${elData.model}
        ${priceInfo}
        Specs/Memory: ${elData.specs}
        Condition: ${elData.condition === 'ideal' ? 'Perfect/Like New' : elData.condition === 'normal' ? 'Good/Normal' : 'Broken/For parts'}
        Kit/Accessories: ${elData.kit}
      `;
    case 'auto':
      const autoData = data as AutoData;
      return `
        Category: Automobiles
        Make/Model: ${autoData.makeModel}
        ${priceInfo}
        Year: ${autoData.year}
        Mileage: ${autoData.mileage}
        Body Nuances/Issues: ${autoData.nuances}
      `;
    case 'services':
      const servData = data as ServicesData;
      return `
        Category: Services
        Service Type: ${servData.serviceType}
        ${priceInfo}
        Experience: ${servData.experience}
        Key Benefit: ${servData.benefit}
      `;
    case 'clothing':
      const clothData = data as ClothingData;
      return `
        Category: Clothing/Apparel
        Item Type: ${clothData.type}
        ${priceInfo}
        Brand: ${clothData.brand}
        Size: ${clothData.size}
        Condition: ${clothData.condition}
      `;
    default:
      return '';
  }
};

const buildPrompt = (category: CategoryId, tone: Tone, data: FormData): string => {
  const details = getDetailsString(category, data);

  const toneInstructions = {
    'aggressive': 'TONE: Energetic, assertive, "Sales" focus. Use phrases like "Успей купить", "Торга нет".',
    'polite': 'TONE: Friendly, sincere, trustworthy. Focus on care and history.',
    'brief': 'TONE: Minimalist, dry, strict facts. List format preferred.',
    'restrained': 'TONE: Calm, objective, professional. Balanced assessment.',
    'natural': 'TONE: Ultra-realistic private seller. Casual, lower-case where appropriate, simple sentences.'
  };

  return `Write a classified ad in Russian for the following item:
  
  ${details}

  ${toneInstructions[tone]}
  
  Format the text using Markdown. Make it visually appealing with bold headers and bulleted lists.
  `;
};

// Next.js client-side env variable access
const getApiKey = () => {
  return process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
};

export const generateAd = async (
  category: CategoryId,
  tone: Tone,
  data: FormData
): Promise<{ adText: string; smartTip: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const modelId = 'gemini-3-flash-preview';
    
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

    const response = await ai.models.generateContent({
      model: modelId,
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
      return {
        adText: result.adText,
        smartTip: result.smartTip
      };
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
        throw new Error("Превышен лимит запросов (Quota Exceeded). Пожалуйста, подождите минуту и попробуйте снова.");
    }
    throw new Error("Не удалось сгенерировать объявление. Проверьте соединение или API ключ.");
  }
};

export const optimizeAdWithKeywords = async (
  currentText: string,
  category: CategoryId,
  data: FormData
): Promise<{ adText: string; keywords: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const modelId = 'gemini-3-flash-preview';

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

    const response = await ai.models.generateContent({
      model: modelId,
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
      return {
          adText: result.rewrittenAd,
          keywords: result.keywords || []
      };
    } else {
      throw new Error("No text returned from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini Optimization Error:", error);
    if (error.message?.includes('429') || error.status === 429 || error.message?.includes('quota')) {
        throw new Error("Превышен лимит запросов. Пожалуйста, подождите минуту.");
    }
    throw new Error("Не удалось оптимизировать объявление.");
  }
};
