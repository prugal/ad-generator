# Руководство по деплою

## Требования

### Node.js
- **Версия**: 20.x LTS (рекомендуется)
- **Минимальная**: 18.17+

### Package Manager
- npm (входит в состав Node.js)
- **Рекомендуется**: npm 10+

## Локальная разработка

### 1. Установка зависимостей

```bash
npm install
```

Установит все зависимости из `package.json`, включая `@google/genai` и `@supabase/supabase-js`.

### 2. Настройка переменных окружения

Создать файл `.env.local` в корне проекта:

```env
# Google Gemini API (Обязательно)
GOOGLE_API_KEY=your_google_gemini_api_key

# Supabase (Обязательно)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Опционально
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Получение ключей:
1. **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Supabase**: [Supabase Dashboard](https://supabase.com/dashboard) -> Project Settings -> API

### 3. Запуск dev-сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`.

### 4. Дополнительные команды

```bash
# Линтинг кода (ESLint)
npm run lint

# Запуск тестов (Vitest)
npm run test

# Production сборка и запуск
npm run build
npm run start
```

---

## Production деплой на Vercel (Рекомендуется)

Vercel — идеальная платформа для Next.js приложений, так как поддерживает API Routes (Serverless Functions) из коробки.

### Вариант 1: Через GitHub (Автоматический CI/CD)

1. **Push to GitHub**: Загрузите ваш код в репозиторий GitHub.
2. **Vercel Dashboard**:
   - Перейдите на [vercel.com/new](https://vercel.com/new).
   - Выберите ваш репозиторий.
3. **Configure Project**:
   - Framework Preset: **Next.js** (определится автоматически).
   - Root Directory: `./` (по умолчанию).
4. **Environment Variables** (Важно!):
   Разверните секцию "Environment Variables" и добавьте:
   - `GOOGLE_API_KEY`: Ваш ключ Gemini.
   - `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key Supabase.
5. **Deploy**: Нажмите кнопку "Deploy".

Vercel автоматически соберет проект, настроит SSL и выдаст домен (например, `ad-generator.vercel.app`).

### Вариант 2: Vercel CLI

Если вы хотите задеплоить прямо из терминала:

1. Установите CLI:
   ```bash
   npm i -g vercel
   ```
2. Авторизуйтесь:
   ```bash
   vercel login
   ```
3. Запустите деплой:
   ```bash
   vercel
   ```
   Следуйте инструкциям в терминале.
4. Добавьте переменные окружения:
   - Зайдите в настройки проекта на vercel.com.
   - Добавьте переменные (см. выше).
   - Передеплойте: `vercel --prod`.

---

## Пост-деплой чеклист

### Функциональность
- [ ] Главная страница открывается без ошибок.
- [ ] Генерация объявлений работает (проверка связи с Gemini).
- [ ] История сохраняется в Supabase (проверьте таблицу `generated_ads`).
- [ ] SEO-оптимизация работает.

### Supabase
- [ ] Убедитесь, что Row Level Security (RLS) настроен (если включен) или таблица доступна для записи (через API Route мы используем серверный ключ, но клиентский supabase клиент использует anon key).
- [ ] **Важно**: Текущая реализация записи в БД идет через API Route, поэтому RLS политики для `anon` роли не требуются для *записи*, но могут потребоваться для *чтения* (если вы планируете выводить историю на клиенте).

---

## CI/CD Pipeline (GitHub Actions)

Проект включает готовый workflow `.github/workflows/ci-cd.yml`:

### Что включает CI/CD:

| Этап | Описание |
|------|----------|
| **Install** | Установка зависимостей (`npm ci`) |
| **Lint** | Проверка кода ESLint (`npm run lint`) |
| **Test** | Запуск unit-тестов Vitest (`npm run test`) |
| **Audit** | Security audit зависимостей (`npm audit`) |
| **Build** | Production сборка (`npm run build`) |
| **Artifact** | Сохранение сборки как артефакта |
| **Deploy** | Деплой на production (при push в main) |

### Workflow структура:

- **Pull Request**: Запускает build, lint, test для проверки
- **Push to main**: Полный цикл + деплой

### Требования для CI/CD:

1. **Node.js 20** (указано в workflow)
2. **Secrets** (если нужен деплой на Vercel):
   - `VERCEL_TOKEN` — для автоматического деплоя

---

## Troubleshooting

### Стили не применяются / Dark mode не работает

**Причина**: Неверная конфигурация Tailwind v4 или повреждённый кэш

**Решение**:
```powershell
# Очистить кэш и пересобрать (PowerShell)
Remove-Item -Recurse -Force .next
npm run dev
```

**Для Tailwind v4**:
- Тема настраивается в `globals.css` через `@custom-variant dark`
- Конфигурация PostCSS: `postcss.config.js` с `@tailwindcss/postcss`
- Проверить что нет старых классов (например `gray-750` → `gray-800`)

### Ошибка: "Unable to acquire lock" / "Failed to restore task data"

**Причина**: Turbopack база данных повреждена или завис процесс

**Решение**:
```powershell
# Остановить все Node процессы и очистить
Get-Process -Name "node" | Stop-Process -Force
Remove-Item -Recurse -Force .next
npm run dev
```

### Ошибка 504 Gateway Timeout (Vercel)
Если генерация занимает более 10 секунд (лимит Vercel Hobby plan):
- Попробуйте упростить промпт.
- Или перейдите на Pro план (лимит 60с).
- Gemini обычно отвечает за 2-5 секунд, так что это редкость.

### Ошибка 500 Internal Server Error
Смотрите логи в Vercel Dashboard -> Functions.
Частые причины:
- Неверный `GOOGLE_API_KEY`.
- Ошибка подключения к Supabase.

### Ошибка 429 Quota Exceeded
Вы исчерпали лимиты Gemini API Free Tier.
- Подождите минуту.
- Или привяжите биллинг в Google Cloud.
