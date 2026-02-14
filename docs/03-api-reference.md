# API Documentation

## Сервисы (Services)

### 1. API Routes (Backend)

Приложение использует Next.js API Routes для взаимодействия с Google Gemini и Supabase. Это позволяет скрыть API ключи и выполнять серверную логику.

#### `POST /api/generate`

Генерация объявления на основе категории, тона и данных формы.

**URL**: `/api/generate`
**Method**: `POST`
**Content-Type**: `application/json`

**Тело запроса (Request Body)**:
```json
{
  "category": "electronics",
  "tone": "polite",
  "data": {
    "model": "iPhone 13 Pro",
    "specs": "256GB, АКБ 87%",
    "condition": "normal",
    "kit": "Коробка, кабель",
    "price": "65000",
    "image": "data:image/jpeg;base64,..." // Опционально
  }
}
```

**Ответ (Response)**:
```json
{
  "adText": "**Продаю iPhone 13 Pro**\n\nТелефон в хорошем состоянии...",
  "smartTip": "Сфотографируйте экран с включенным дисплеем, чтобы показать отсутствие битых пикселей."
}
```

**Ошибки**:
- `429`: Превышен лимит запросов (Quota Exceeded).
- `503`: Сервис временно перегружен (Retry-After header).
- `500`: Внутренняя ошибка сервера.

---

#### `POST /api/optimize`

SEO-оптимизация существующего объявления.

**URL**: `/api/optimize`
**Method**: `POST`
**Content-Type**: `application/json`

**Тело запроса (Request Body)**:
```json
{
  "currentText": "Продаю телефон...",
  "category": "electronics",
  "data": { ... }
}
```

**Ответ (Response)**:
```json
{
  "adText": "Продаю **iPhone 13 Pro** (256 ГБ)...",
  "keywords": ["iphone 13 pro", "айфон бу", "смартфон apple", "256 гб"]
}
```

---

### 2. Client Services (`services/`)

#### `geminiService.ts`

Клиентская обертка для вызова API эндпоинтов.

- `generateAd(category, tone, data)`: Вызывает `/api/generate`.
- `optimizeAdWithKeywords(currentText, category, data)`: Вызывает `/api/optimize`.

#### `supabase.ts`

Клиент для взаимодействия с базой данных Supabase.

```typescript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

#### `analytics.ts`

Сервис для отслеживания событий в Google Analytics 4.

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

### Данные форм (FormData)
Типы данных зависят от выбранной категории (`ElectronicsData`, `AutoData`, `ServicesData`, `ClothingData`). См. исходный код `types.ts` для деталей.

---

## Конфигурация Gemini (Server-side)

### Модель
Используется модель `gemini-flash-latest` (или `gemini-1.5-flash` в зависимости от доступности) для оптимального баланса скорости и качества.

### Retry Logic
В API реализована логика повторных попыток (Exponential Backoff):
- Максимум 3 попытки.
- Задержки: 1s, 2s, 4s.
- Обрабатывает коды 429 и 503.

### Vision API
Для категорий `electronics` и `clothing` поддерживается передача изображений в формате Base64. Изображение анализируется моделью для добавления визуальных деталей в описание, но **удаляется** перед сохранением в базу данных.

---

## Environment Variables

Для работы приложения требуются следующие переменные окружения (в `.env.local` или настройках Vercel):

### Обязательные

```env
# Google Gemini API (серверная переменная, не публичная)
GOOGLE_API_KEY=your_gemini_api_key
# или альтернативно: GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Опциональные

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site URL для SEO и ссылок
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Важно**: `GOOGLE_API_KEY` — серверная переменная (без префикса `NEXT_PUBLIC_`), она используется только в API Routes и не попадает в клиентский бандл.
