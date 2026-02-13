import { CategoryId, Tone, FormData, ElectronicsData, AutoData, ServicesData, ClothingData } from "../types";

export const getSystemInstruction = () => {
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

export const getDetailsString = (category: CategoryId, data: FormData): string => {
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

export const buildPrompt = (category: CategoryId, tone: Tone, data: FormData): string => {
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
