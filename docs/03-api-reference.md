# API Documentation

## Сервисы (Services)

### 1. Gemini Service (`services/geminiService.ts`)

Основной сервис для взаимодействия с Google Gemini API.

#### Основные функции

##### `generateAd()`

Генерация объявления на основе категории, тона и данных формы.

```typescript
export const generateAd = async (
  category: CategoryId,
  tone: Tone,
  data: FormData
): Promise<{ adText: string; smartTip: string }>
```

**Параметры**:
| Параметр | Тип | Описание |
|----------|-----|----------|
| `category` | `CategoryId` | Категория: 'electronics' \| 'auto' \| 'services' \| 'clothing' |
| `tone` | `Tone` | Тон: 'aggressive' \| 'polite' \| 'brief' \| 'restrained' \| 'natural' |
| `data` | `FormData` | Данные формы (специфичны для категории) |

**Возвращает**:
```typescript
{
  adText: string;      // Сгенерированное объявление (Markdown)
  smartTip: string;    // Умный совет от AI (10-20 слов)
}
```

**Ошибки**:
- `Превышен лимит запросов (Quota Exceeded)` — 429 от Gemini
- `Не удалось сгенерировать объявление` — общая ошибка

**Пример использования**:
```typescript
const { adText, smartTip } = await generateAd('electronics', 'polite', {
  model: 'iPhone 13 Pro',
  specs: '256GB, АКБ 87%',
  condition: 'normal',
  kit: 'Коробка, кабель',
  price: '65000'
});
```

---

##### `optimizeAdWithKeywords()`

SEO-оптимизация существующего объявления.

```typescript
export const optimizeAdWithKeywords = async (
  currentText: string,
  category: CategoryId,
  data: FormData
): Promise<{ adText: string; keywords: string[] }>
```

**Параметры**:
| Параметр | Тип | Описание |
|----------|-----|----------|
| `currentText` | `string` | Текущий текст объявления |
| `category` | `CategoryId` | Категория товара |
| `data` | `FormData` | Исходные данные формы |

**Возвращает**:
```typescript
{
  adText: string;      // Переписанное объявление с ключевыми словами
  keywords: string[];  // Массив SEO-ключевых слов (5-8 шт)
}
```

---

#### Вспомогательные функции

##### `getSystemInstruction()`

Возвращает системный промпт для Gemini с инструкциями по формату и стилю.

**Содержит**:
- Требования к Markdown форматированию
- Структура объявления (Hook → Body → Details → CTA)
- Инструкции для генерации умного совета
- Контекст российских площадок (Авито/Юла)

##### `getDetailsString()`

Формирует текстовое описание товара для промпта.

##### `buildPrompt()`

Собирает финальный промпт с учётом тона.

**Тоновые инструкции**:
```typescript
const toneInstructions = {
  'aggressive': 'TONE: Energetic, assertive, "Sales" focus. Use phrases like "Успей купить", "Торга нет".',
  'polite': 'TONE: Friendly, sincere, trustworthy. Focus on care and history.',
  'brief': 'TONE: Minimalist, dry, strict facts. List format preferred.',
  'restrained': 'TONE: Calm, objective, professional. Balanced assessment.',
  'natural': 'TONE: Ultra-realistic private seller. Casual, lower-case where appropriate, simple sentences.'
};
```

---

### 2. Analytics Service (`services/analytics.ts`)

Сервис для отслеживания событий в Google Analytics 4.

#### Функции

##### `logEvent()`

```typescript
export const logEvent = (
  eventName: string,
  params?: Record<string, any>
): void
```

**Отслеживаемые события**:

| Событие | Параметры | Когда вызывается |
|---------|-----------|------------------|
| `change_category` | `{ category }` | Смена категории |
| `change_tone` | `{ tone }` | Смена тона |
| `generate_ad_click` | `{ category, tone }` | Клик на генерацию |
| `generate_ad_success` | `{ category }` | Успешная генерация |
| `generate_ad_error` | `{ category, error }` | Ошибка генерации |
| `optimize_ad_click` | `{ category }` | Клик на SEO |
| `optimize_ad_success` | `{ category, keyword_count }` | Успешная оптимизация |
| `optimize_ad_error` | `{ category, error }` | Ошибка оптимизации |
| `copy_ad_click` | `{ category }` | Копирование текста |
| `share_ad_click` | `{ method, category }` | Поделиться |
| `toggle_theme` | `{ theme }` | Смена темы |

---

## Типы данных (`types.ts`)

### Категории

```typescript
export type CategoryId = 'electronics' | 'auto' | 'services' | 'clothing';
```

### Тоны текста

```typescript
export type Tone = 'aggressive' | 'polite' | 'brief' | 'restrained' | 'natural';
```

### Данные форм по категориям

#### ElectronicsData

```typescript
export interface ElectronicsData {
  model: string;                    // Название модели (обязательное)
  specs: string;                    // Характеристики (обязательное)
  condition: 'ideal' | 'normal' | 'broken';  // Состояние
  kit: string;                      // Комплект
  image?: string;                   // Base64 фото
  price?: string;                   // Цена
}
```

#### AutoData

```typescript
export interface AutoData {
  makeModel: string;    // Марка/модель (обязательное)
  year: string;         // Год выпуска (обязательное)
  mileage: string;      // Пробег (обязательное)
  nuances: string;      // Нюансы по кузову/технике
  price?: string;       // Цена
}
```

#### ServicesData

```typescript
export interface ServicesData {
  serviceType: string;   // Вид услуги (обязательное)
  experience: string;  // Опыт работы (обязательное)
  benefit: string;     // Главное преимущество (обязательное)
  price?: string;      // Цена/ставка
}
```

#### ClothingData

```typescript
export interface ClothingData {
  type: string;         // Тип вещи (обязательное)
  size: string;         // Размер (обязательное)
  condition: string;    // Состояние (обязательное)
  brand: string;        // Бренд
  image?: string;       // Base64 фото
  price?: string;       // Цена
}
```

### Общее состояние приложения

```typescript
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
```

---

## Gemini API Configuration

### Модель

```typescript
const modelId = 'gemini-3-flash-preview';
```

### Параметры генерации

```typescript
{
  temperature: 0.8,           // Баланс креативности и точности
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      adText: { type: Type.STRING },
      smartTip: { type: Type.STRING }
    },
    required: ["adText", "smartTip"]
  }
}
```

### Vision API (Изображения)

Для категорий `electronics` и `clothing` поддерживается анализ изображений:

```typescript
const parts = [
  { text: promptText },
  {
    inlineData: {
      data: base64Image,
      mimeType: 'image/jpeg'  // или 'image/png'
    }
  }
];
```

**Ограничения**:
- Максимальный размер: 4MB
- Форматы: JPEG, PNG
- Передаются как base64 Data URL

---

## Environment Variables

```env
# Обязательная
NEXT_PUBLIC_API_KEY=your_gemini_api_key_here

# Опциональная (Analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Опциональная (SEO/Canonical)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Получение API ключа

1. Перейти на [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Создать новый API ключ
3. Ограничить по HTTP referer (домену) в настройках
4. Скопировать в `.env.local`

---

## Rate Limiting

### Клиентская квота

```typescript
const RPM_LIMIT = 15;  // Requests Per Minute
```

Реализация через localStorage:
```typescript
const QUOTA_KEY = 'ai_ads_quota_timestamps';

// Сохраняем timestamp каждого запроса
const timestamps: number[] = JSON.parse(localStorage.getItem(QUOTA_KEY) || '[]');
timestamps.push(Date.now());
localStorage.setItem(QUOTA_KEY, JSON.stringify(timestamps));

// Фильтруем только последние 60 секунд
const valid = timestamps.filter(t => now - t < 60000);
```

### Серверная квота (Gemini)

- Free tier: 15 RPM, 1,000,000 TPM, 1,500 RPD
- Проверить лимиты: [Google AI Dashboard](https://aistudio.google.com/app/plan_information)

---

## JSON Schema ответа

### Генерация объявления

```json
{
  "adText": "**Заголовок объявления**\n\nТекст объявления с **жирным** и списками:\n- Пункт 1\n- Пункт 2",
  "smartTip": "Сфотографируйте бирку с составом — это снимает вопросы."
}
```

### SEO-оптимизация

```json
{
  "rewrittenAd": "Оптимизированный текст...",
  "keywords": ["iphone 13", "айфон", "256гб", "pro", "бу"]
}
```
