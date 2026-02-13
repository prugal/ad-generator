const { GoogleGenAI } = require("@google/genai");

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.list();
    console.log("Raw response:", JSON.stringify(response, null, 2));
    if (response && Array.isArray(response)) {
        response.forEach(model => {
            console.log(`- ${model.name}`);
        });
    } else if (response && response.models) {
        response.models.forEach(model => {
            console.log(`- ${model.name}`);
        });
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
