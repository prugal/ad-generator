# CI/CD Pipeline Documentation

## Обзор
В проекте настроен автоматизированный CI/CD пайплайн с использованием **GitHub Actions**. Это обеспечивает автоматическую сборку, тестирование и развертывание приложения при каждом изменении кода.

## Архитектура Пайплайна

Пайплайн описан в файле `.github/workflows/ci-cd.yml` и состоит из трех основных этапов (Jobs):

### 1. Build and Test (`build-and-test`)
Запускается при каждом `push` в `main` и при каждом Pull Request.
**Шаги:**
1.  **Checkout**: Клонирование репозитория.
2.  **Setup Node.js**: Установка Node.js v20 и кеширование зависимостей npm.
3.  **Install**: Установка зависимостей через `npm ci` (Clean Install).
4.  **Lint**: Проверка качества кода (`npm run lint`).
5.  **Test**: Запуск модульных тестов (`npm test run`).
6.  **Audit**: Проверка уязвимостей пакетов (`npm audit`).
7.  **Build**: Сборка Next.js приложения (`npm run build`).
8.  **Artifact Upload**: Сохранение собранного приложения (`.next/`) для следующих этапов.

### 2. Deploy to Preview (`deploy-preview`)
Запускается только для Pull Request, если этап `build-and-test` прошел успешно.
*Симулирует развертывание в тестовую среду (Preview).*

### 3. Deploy to Production (`deploy-production`)
Запускается только при пуше в ветку `main`, если этап `build-and-test` прошел успешно.
Использует GitHub Environment `production` (позволяет настроить ручное подтверждение).
*Симулирует развертывание в продакшн.*

## Настройка GitHub

Для полноценной работы (особенно ручного подтверждения деплоя) необходимо настроить репозиторий:

1.  Перейдите в **Settings** -> **Environments**.
2.  Создайте Environment с именем `production`.
3.  В настройках Environment включите **Required reviewers** и укажите пользователей, которые должны подтверждать деплой.

## Как добавить Vercel Deployment (Реальный)

Для реального деплоя на Vercel нужно:

1.  Получить **Vercel Token** и **Project ID**.
2.  Добавить их в **Settings** -> **Secrets and variables** -> **Actions** (например, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
3.  Раскомментировать команды в файле workflow:
    ```yaml
    - name: Install Vercel CLI
      run: npm install --global vercel@latest
    - name: Pull Vercel Environment Information
      run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
    - name: Build Project Artifacts
      run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
    - name: Deploy Project Artifacts to Vercel
      run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
    ```

## Тестирование
Для локального запуска тестов используйте:
```bash
npm test        # Запуск тестов в режиме watch
npm test run    # Однократный запуск
```
