
export type CategoryId = 'electronics' | 'auto' | 'services' | 'clothing';

export type Tone = 'aggressive' | 'polite' | 'brief' | 'restrained' | 'natural';

export interface ElectronicsData {
  model: string;
  specs: string;
  condition: 'ideal' | 'normal' | 'broken';
  kit: string;
  image?: string;
  price?: string;
}

export interface AutoData {
  makeModel: string;
  year: string;
  mileage: string;
  nuances: string;
  price?: string;
}

export interface ServicesData {
  serviceType: string;
  experience: string;
  benefit: string;
  price?: string;
}

export interface ClothingData {
  type: string;
  size: string;
  condition: string;
  brand: string;
  image?: string;
  price?: string;
}

// Union type for all form data
export type FormData = ElectronicsData | AutoData | ServicesData | ClothingData;

export interface AppState {
  category: CategoryId;
  tone: Tone;
  formData: {
    electronics: ElectronicsData;
    auto: AutoData;
    services: ServicesData;
    clothing: ClothingData;
  };
  generatedText: string;
  smartTip: string | null;
  keywords: string[];
  isLoading: boolean;
  isOptimizing: boolean;
  error: string | null;
  validationErrors: Record<string, boolean>;
}
