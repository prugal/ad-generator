export type LlmProviderName = 'gemini' | 'polza';

export interface LlmImageInput {
  mimeType: string;
  data: string;
}

export interface LlmGenerateJsonRequest {
  prompt: string;
  systemInstruction?: string;
  modelId?: string;
  temperature?: number;
  responseSchema: unknown;
  image?: LlmImageInput;
}

export interface LlmGenerateJsonResult {
  text: string;
  provider: LlmProviderName;
  model: string;
}

export interface LlmProvider {
  readonly name: LlmProviderName;
  generateJson(request: LlmGenerateJsonRequest): Promise<LlmGenerateJsonResult>;
}
