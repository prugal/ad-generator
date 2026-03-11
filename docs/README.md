# AI Classifieds Ad Generator - Documentation

## О проекте

**AI Classifieds Ad Generator** — это SaaS-приложение для генерации SEO-оптимизированных объявлений для российских площадок (Авито, Юла) с использованием искусственного интеллекта Google Gemini.

## Содержание документации

- **[01-architecture.md](./01-architecture.md)** — Техническая архитектура, стек технологий, структура проекта
- **[02-user-flow.md](./02-user-flow.md)** — Пользовательский путь, сценарии использования
- **[03-api-reference.md](./03-api-reference.md)** — API документация, сервисы
- **[04-components.md](./04-components.md)** — Референс компонентов React
- **[05-deployment.md](./05-deployment.md)** — Руководство по деплою


## Ключевые возможности

- 🤖 Генерация продающих объявлений с помощью AI
- 📸 Анализ фотографий товара (для электроники и одежды)
- 🎨 5 стилей тона (Продающий, Вежливый, Краткий, Сдержанный, Человечный)
- 🔍 SEO-оптимизация с автоматическим подбором ключевых слов
- 💡 Умные советы от AI по улучшению объявлений
- 🌙 Тёмная/светлая тема
- 📱 Адаптивный дизайн
- 💳 Прием платежей через Robokassa
- 🔐 Аутентификация пользователей (Google)
- 💰 Система кредитов для контроля использования

## Технологический стек

- **Frontend**: Next.js 16.1.6 + React 19.2.4 + TypeScript 5.5.3
- **Styling**: TailwindCSS v4 + PostCSS
- **State Management**: Zustand
- **AI API**: Google Gemini 3 Flash Preview
- **Auth**: Supabase Auth
- **Payments**: Robokassa
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Markdown**: React Markdown

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Линтинг
npm run lint

# Запуск тестов
npm run test

# Сборка для продакшена
npm run build
```

## Переменные окружения

```env
# Google Gemini API (Обязательно)
GOOGLE_API_KEY=your_google_gemini_api_key
# или GEMINI_API_KEY=your_gemini_api_key

# Supabase (Обязательно)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Robokassa (Обязательно)
ROBOKASSA_MERCHANT_LOGIN=your_merchant_login
ROBOKASSA_PASSWORD1=your_password1
ROBOKASSA_PASSWORD2=your_password2
ROBOKASSA_TEST_MODE=true

# Опционально
NEXT_PUBLIC_SITE_URL=https://profit-text.ru
```

## Настройка Robokassa

В личном кабинете Robokassa (https://partner.robokassa.ru/) в разделе "Технические настройки" укажите:

**URL для взаимодействия:**
- Result URL: `https://profit-text.ru/api/payment/result`
- Success URL: `https://profit-text.ru/api/payment/success`
- Fail URL: `https://profit-text.ru/payment/fail`

**Методы отправки:**
- Result URL: `POST` (допустимо также `GET`)
- Success URL: `GET`
- Fail URL: `GET`

**Алгоритм хеширования:** `MD5`

**Тестовый режим:**
1. Включите "Тестовый режим" в кабинете Robokassa
2. Укажите тестовые пароли #1 и #2 в блоке "Параметры тестовых платежей"
3. В env установите `ROBOKASSA_TEST_MODE=true` и используйте тестовые пароли

**Боевой режим:**
1. После активации магазина используйте боевые пароли #1 и #2
2. В env установите `ROBOKASSA_TEST_MODE=false`
```

## Структура папок

```
├── app/              # Next.js App Router страницы
├── components/       # React компоненты
├── services/         # API сервисы (Gemini)
├── docs/            # Документация
├── public/          # Статические файлы
└── types.ts         # TypeScript типы
```

## Лицензия

© 2025 AI Classifieds Ad Generator
