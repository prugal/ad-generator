# Руководство по деплою

## Требования

### Node.js
- Версия: 18.17+ (LTS)
- Рекомендуется: 20.x LTS

### Package Manager
- npm (входит в состав Node.js)
- Рекомендуется: npm 10+

## Локальная разработка

### 1. Установка зависимостей

```bash
npm install
```

Установит все зависимости из `package.json`:
- next
- react
- @google/genai
- tailwindcss
- lucide-react
- react-markdown
- typescript

### 2. Настройка переменных окружения

Создать файл `.env.local` в корне проекта:

```env
# Обязательно
NEXT_PUBLIC_API_KEY=your_google_gemini_api_key

# Опционально
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Получение API ключа Google Gemini

1. Перейти на [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Нажать "Create API Key"
3. Выбрать или создать проект
4. Скопировать ключ
5. Вставить в `.env.local`

#### Настройка ограничений API ключа (рекомендуется)

В Google Cloud Console:
1. APIs & Services → Credentials
2. Найти свой API ключ
3. Edit API Key
4. Application restrictions → HTTP referrers
5. Добавить: `localhost:3000/*` и `your-domain.com/*`
6. API restrictions → Google Generative Language API
7. Save

### 3. Запуск dev-сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`
- Hot reload включён
- Error overlay для разработки
- Source maps доступны

### 4. Сборка для production

```bash
npm run build
```

Создаёт папку `.next/` с:
- Оптимизированным JS/CSS
- Pre-rendered HTML
- Assets

### 5. Запуск production build локально

```bash
npm run build
npm run start
```

Сервер запустится на `http://localhost:3000` в production режиме.

---

## Production деплой

### Вариант 1: Vercel (Рекомендуется)

**Почему Vercel**: Оптимальная интеграция с Next.js, edge network, автоматический CI/CD.

#### Шаги:

1. **Подготовка**
   - Создать аккаунт на [vercel.com](https://vercel.com)
   - Подключить GitHub/GitLab репозиторий

2. **Импорт проекта**
   - Click "Add New Project"
   - Выбрать репозиторий
   - Framework Preset: Next.js

3. **Настройка Environment Variables**
   ```
   NEXT_PUBLIC_API_KEY = your_gemini_api_key
   NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX  (опционально)
   NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
   ```

4. **Deploy**
   - Нажать "Deploy"
   - Автоматический build
   - Получить URL: `https://your-project.vercel.app`

5. **Custom Domain** (опционально)
   - Project Settings → Domains
   - Добавить свой домен
   - Следовать инструкциям по DNS

#### Vercel CLI

```bash
# Установка
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

---

### Вариант 2: Netlify

#### Шаги:

1. **Подготовка**
   - Создать аккаунт на [netlify.com](https://netlify.com)
   - Подключить репозиторий

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Site settings → Environment variables
   - Добавить все переменные из `.env.local`

4. **Деплой**
   - Автоматический при push в main
   - Или ручной через "Deploy site"

---

### Вариант 3: Static Export (без сервера)

Для хостинга без Node.js (GitHub Pages, S3, etc.)

#### Настройка next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
};

export default nextConfig;
```

#### Сборка

```bash
npm run build
```

Создаёт папку `dist/` с:
- `index.html` — главная страница
- Статические assets
- `/_next/` — JS/CSS бандлы

#### Ограничения static export:

❌ Не работает:
- API Routes
- Server-side rendering (SSR)
- Image optimization next/image
- Revalidate

✅ Работает:
- Этот проект (только клиентская генерация)
- Static generation (SSG)

---

## Платформы хостинга

### Сравнение

| Платформа | Сложность | Цена | Next.js оптимизация | Custom Domain |
|-----------|-----------|------|---------------------|---------------|
| **Vercel** | Легко | Free tier | Отличная | ✅ |
| **Netlify** | Легко | Free tier | Хорошая | ✅ |
| **Railway** | Средне | $5+/мес | Хорошая | ✅ |
| **Render** | Легко | Free tier | Хорошая | ✅ |
| **AWS Amplify** | Средне | Free tier | Хорошая | ✅ |
| **GitHub Pages** | Легко | Free | Только static | ✅ |

### Рекомендации

- **MVP / Бесплатно**: Vercel или Netlify
- **Свой сервер**: Railway, Render, DigitalOcean
- **Enterprise**: Vercel Pro, AWS

---

## Пост-деплой чеклист

### Функциональность
- [ ] Главная страница загружается
- [ ] Переход в /app работает
- [ ] Выбор категорий
- [ ] Заполнение формы
- [ ] Генерация объявления (с API ключом)
- [ ] Копирование результата
- [ ] SEO оптимизация
- [ ] Переключение темы
- [ ] Модальное окно правил

### SEO
- [ ] Title корректный
- [ ] Description в meta
- [ ] OG теги присутствуют
- [ ] Favicon загружается
- [ ] Канонический URL установлен

### Analytics
- [ ] Google Analytics загружается
- [ ] События отправляются
- [ ] Realtime показывает посетителей

### Производительность
- [ ] First Contentful Paint < 1.5s
- [ ] Lighthouse score > 90
- [ ] No console errors

---

## Environment Variables Reference

| Переменная | Обязательная | Описание | Пример |
|------------|--------------|----------|--------|
| `NEXT_PUBLIC_API_KEY` | ✅ | Google Gemini API ключ | `AIzaSy...` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ❌ | Google Analytics ID | `G-ABC123DEF` |
| `NEXT_PUBLIC_SITE_URL` | ❌ | Канонический URL | `https://example.com` |

### Безопасность

⚠️ **Важно**: `NEXT_PUBLIC_` префикс делает переменную доступной в браузере.

**Защита API ключа**:
1. Ограничить по HTTP referer в Google Console
2. Мониторить использование
3. Не коммитить `.env.local`
4. Использовать разные ключи для dev/prod

---

## Troubleshooting

### Ошибка: "Quota Exceeded"

**Причина**: Превышен лимит Gemini API (15 RPM на free tier)

**Решение**:
- Подождать 1 минуту
- Или обновить тариф в Google AI Studio
- Или добавить платёжный метод для higher quotas

### Ошибка: "Invalid API Key"

**Причина**: Неверный или отсутствующий API ключ

**Решение**:
1. Проверить `.env.local`
2. Перезапустить dev сервер
3. Проверить ключ в Google AI Studio

### Ошибка сборки: "Module not found"

**Причина**: Отсутствуют зависимости

**Решение**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Ошибка: "Hydration failed"

**Причина**: Несоответствие server/client render

**Решение**:
- Убедиться что localStorage доступен только после mount
- Проверить `mounted` state в AdGenerator

### Стили не применяются

**Причина**: Неверная конфигурация Tailwind

**Решение**:
```bash
# Пересобрать Tailwind
rm -rf .next
npm run build
```

---

## CI/CD (GitHub Actions)

### Пример workflow для Vercel

`.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Обновление проекта

### Обновление зависимостей

```bash
# Проверить устаревшие пакеты
npm outdated

# Обновить все
npm update

# Или по одному
npm install next@latest
```

### Обновление Next.js

```bash
npm install next@latest react@latest react-dom@latest
```

Проверить [Next.js Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading) на breaking changes.

---

## Мониторинг

### Vercel Analytics

Бесплатный тир включает:
- Web Analytics (page views, visitors)
- Performance Insights
- Real-time logs

### Google Analytics 4

Настройка:
1. Создать GA4 property
2. Получить Measurement ID (G-XXXXXXXX)
3. Добавить в env variables
4. Подтвердить в Realtime отчёте

### Uptime мониторинг

Рекомендуемые сервисы:
- UptimeRobot (бесплатный)
- Pingdom
- BetterUptime

---

## Масштабирование

### При росте трафика

1. **Upgrade Gemini API**: Перейти на paid tier для higher rate limits
2. **Enable Vercel Analytics**: Мониторинг производительности
3. **CDN**: Vercel/Netlify уже используют edge CDN
4. **Image optimization**: Для больших фото использовать external CDN

### При росте команды

1. **Branch protection**: Запретить push в main
2. **Pull requests**: Обязательное code review
3. **Staging environment**: Превью деплои на PR
4. **Testing**: Добавить unit/e2e тесты
