# Техническая архитектура

## Общий обзор

AI Classifieds Ad Generator — это клиентское веб-приложение на Next.js с минимальным серверным кодом. Вся логика генерации выполняется через клиентский API Google Gemini.

## Архитектура системы

```
┌─────────────────────────────────────────────────────────┐
│                     Клиент (Браузер)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Next.js 14 (App Router)              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐    │    │
│  │  │  Pages   │  │Components│  │  Services  │    │    │
│  │  │          │  │          │  │            │    │    │
│  │  │ /        │  │AdGenerator│ │ gemini    │    │    │
│  │  │ /app     │  │InputField│  │ analytics │    │    │
│  │  │          │  │...       │  │           │    │    │
│  │  └──────────┘  └──────────┘  └────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│              Google GenAI SDK (Client)                  │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────┐
│              Google Gemini API                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  • Gemini 3 Flash Preview Model                 │    │
│  │  • Text Generation with JSON Schema              │    │
│  │  • Vision Capabilities (Image Analysis)        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Стек технологий

### Frontend Core
| Технология | Версия | Назначение |
|------------|--------|------------|
| Next.js | 14.2.5 | React фреймворк с App Router |
| React | 18.3.1 | UI библиотека |
| TypeScript | 5.5.3 | Типизация |

### Стилизация
| Технология | Назначение |
|------------|------------|
| TailwindCSS | Утилитарный CSS фреймворк |
| PostCSS | Обработка CSS |
| Autoprefixer | Префиксы для браузеров |

### AI и данные
| Технология | Назначение |
|------------|------------|
| @google/genai | Клиентский SDK для Gemini API |
| react-markdown | Рендеринг markdown из AI |

### UI компоненты
| Технология | Назначение |
|------------|------------|
| lucide-react | Иконки |

## Структура проекта

```
d:\Work\Projects\ai-classifieds-ad-generator/
├── app/                          # Next.js App Router
│   ├── globals.css              # Глобальные стили
│   ├── layout.tsx               # Корневой layout с метаданными
│   └── page.tsx                 # Главная страница (landing)
│
├── components/                   # React компоненты
│   ├── AdGenerator.tsx          # Основной компонент приложения
│   ├── CategoryCard.tsx         # Карточка категории
│   ├── InputField.tsx           # Поле ввода с валидацией
│   ├── SelectField.tsx          # Выпадающий список
│   ├── ToneSelector.tsx         # Выбор тона текста
│   ├── ImageUpload.tsx          # Загрузка изображений
│   └── RulesModal.tsx           # Модальное окно с правилами
│
├── services/                     # Сервисы и API
│   ├── geminiService.ts         # Интеграция с Google Gemini
│   └── analytics.ts             # Google Analytics
│
├── docs/                        # Документация
├── public/                      # Статические файлы
├── types.ts                     # TypeScript интерфейсы
├── tailwind.config.js           # Конфигурация Tailwind
├── next.config.mjs              # Конфигурация Next.js
└── package.json                 # Зависимости
```

## Ключевые технические решения

### 1. Клиентская генерация (Client-side rendering)

**Почему**: Google Gemini API вызывается напрямую из браузера через `@google/genai` SDK.

**Плюсы**:
- Нет необходимости в backend server
- Мгновенный отклик для пользователя
- Простое развёртывание (static hosting)

**Минусы**:
- API ключ виден в браузере (требуется ограничение по домену в Google Console)
- Зависимость от клиентского соединения

### 2. Система квот (Rate Limiting)

```typescript
const RPM_LIMIT = 15; // Запросов в минуту
const QUOTA_KEY = 'ai_ads_quota_timestamps';
```

Реализована клиентская защита от превышения лимитов Google API:
- Трекинг timestamp каждого запроса в localStorage
- Автоматическая очистка устаревших записей (> 60 сек)
- Визуальный индикатор оставшихся запросов

### 3. Управление состоянием

Используется React `useState` с централизованным состоянием в `AdGenerator`:

```typescript
interface AppState {
  category: CategoryId;           // Текущая категория
  tone: Tone;                   // Выбранный тон
  formData: {                   // Данные форм по категориям
    electronics: ElectronicsData;
    auto: AutoData;
    services: ServicesData;
    clothing: ClothingData;
  };
  generatedText: string;        // Сгенерированный текст
  smartTip: string | null;      // Умный совет от AI
  keywords: string[];           // SEO ключевые слова
  isLoading: boolean;         // Флаг генерации
  isOptimizing: boolean;      // Флаг SEO-оптимизации
  error: string | null;        // Ошибки
  validationErrors: Record<string, boolean>; // Ошибки валидации
}
```

### 4. Persistency (localStorage)

Данные автоматически сохраняются:

```typescript
const STORAGE_KEY = 'ai_ads_app_state_v1';
const THEME_KEY = 'ai_ads_theme';
const QUOTA_KEY = 'ai_ads_quota_timestamps';
```

- Состояние форм (category, tone, formData)
- Сгенерированные объявления
- Предпочтения темы
- Квоты запросов

### 5. Темизация (Dark Mode)

```typescript
// Tailwind dark mode через class strategy
darkMode: 'class' // в tailwind.config.js

// Переключение темы
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');
```

Все компоненты используют парные классы:
```
bg-white dark:bg-gray-800
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700
```

### 6. Валидация форм

Клиентская валидация перед отправкой:
- Проверка обязательных полей по категории
- Визуальная индикация ошибок (красная обводка)
- Блокировка кнопки генерации при ошибках

### 7. Обработка изображений

Для категорий `electronics` и `clothing`:
- Загрузка файлов до 4MB
- Конвертация в base64 (Data URL)
- Отправка в Gemini как inlineData
- Автоматический fallback при переполнении localStorage

## Безопасность

### API Key защита
1. Используется `NEXT_PUBLIC_API_KEY` — ключ виден в браузере
2. **Рекомендуется**: ограничить домены в Google AI Studio
3. **Рекомендуется**: добавить rate limiting на уровне API

### Content Security
- Политика контента определяется площадками (Авито/Юла)
- AI инструкции запрещают генерацию запрещённого контента

## Производительность

### Оптимизации:
1. **Code splitting**: Next.js автоматически разбивает код
2. **Lazy loading**: Модальные окна рендерятся по требованию
3. **Debounced persistency**: Сохранение в localStorage с задержкой 500ms
4. **Image optimization**: Ограничение 4MB, object-contain для превью

### Метрики:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: ~200KB (gzipped)
