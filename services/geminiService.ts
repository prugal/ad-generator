import { CategoryId, Tone, FormData } from "../types";

export const generateAd = async (
  category: CategoryId,
  tone: Tone,
  data: FormData
): Promise<{ adText: string; smartTip: string }> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, tone, data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      adText: result.adText,
      smartTip: result.smartTip
    };
  } catch (error: unknown) {
    console.error("Generate Ad API Error:", error);
    const err = error as Error;
    if (err.name === 'TypeError' && err.message === 'fetch failed') {
        throw new Error("Ошибка сети: не удалось подключиться к серверу. Проверьте соединение.");
    }
    throw error; // Re-throw to be handled by the UI
  }
};

export const optimizeAdWithKeywords = async (
  currentText: string,
  category: CategoryId,
  data: FormData,
  modelId?: string
): Promise<{ adText: string; keywords: string[] }> => {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentText, category, data, modelId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      adText: result.adText,
      keywords: result.keywords
    };
  } catch (error: unknown) {
    console.error("Optimize Ad API Error:", error);
    throw error;
  }
};
