# Компоненты React

## Основной компонент: AdGenerator

**Файл**: `components/AdGenerator.tsx`
**Тип**: Client Component (`'use client'`)

Главный компонент приложения, содержит всю бизнес-логику и управление состоянием.

### State Management

```typescript
const [state, setState] = useState<AppState>({
  category: 'electronics',
  tone: 'polite',
  formData: { /* ... */ },
  generatedText: '',
  smartTip: null,
  keywords: [],
  isLoading: false,
  isOptimizing: false,
  error: null,
  validationErrors: {}
});
```

### Key Hooks

| Hook | Назначение |
|------|------------|
| `useState` | Управление состоянием форм и UI |
| `useEffect` | localStorage persistency, theme, hydration fix |
| `useRef` | Скролл к результату (`resultRef`) |

### Основные функции

#### `handleCategoryChange(id: CategoryId)`
Смена категории сбрасывает результат и ошибки валидации.

#### `updateFormData(field: string, value: string)`
Обновление поля формы с очисткой ошибки валидации.

#### `validateForm(): boolean`
Валидация обязательных полей по текущей категории.

**Правила валидации**:
- **Electronics**: model, specs (обязательные)
- **Auto**: makeModel, year, mileage (обязательные)
- **Services**: serviceType, experience, benefit (обязательные)
- **Clothing**: type, size, condition (обязательные)

#### `handleGenerate()`
Главная функция генерации:
1. Проверка квоты
2. Валидация формы
3. Логирование аналитики
4. Вызов `generateAd()`
5. Обновление состояния
6. Скролл к результату

#### `handleOptimize()`
SEO-оптимизация существующего текста.

#### `handleCopy()`
Копирование в буфер обмена с визуальным feedback (2 сек).

#### `handleShare()`
Использует Web Share API или открывает модальное окно.

### Рендеринг форм: `renderForm()`

```typescript
const renderForm = () => {
  switch (state.category) {
    case 'electronics': return <ElectronicsForm />;
    case 'auto': return <AutoForm />;
    case 'services': return <ServicesForm />;
    case 'clothing': return <ClothingForm />;
  }
};
```

---

## UI Компоненты

### CategoryCard

**Файл**: `components/CategoryCard.tsx`

Карточка выбора категории с анимацией.

```typescript
interface CategoryCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}
```

**Визуальные состояния**:
- **Selected**: `border-primary-600`, `bg-primary-50/50`, `scale-105`, пульсирующий индикатор
- **Default**: `border-gray-100`, hover эффекты

**Использование**:
```tsx
<CategoryCard 
  id="electronics" 
  label="Электроника" 
  icon={Smartphone} 
  isSelected={category === 'electronics'} 
  onClick={() => handleCategoryChange('electronics')} 
/>
```

---

### InputField

**Файл**: `components/InputField.tsx`

Универсальное поле ввода с поддержкой textarea.

```typescript
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea';
  rows?: number;
  error?: boolean;
}
```

**Особенности**:
- Валидация: красная обводка при `error=true`
- Поддержка textarea с `type="textarea"`
- Индикатор обязательного поля при ошибке

**Стили ошибки**:
```
border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800
```

**Стили нормального состояния**:
```
border-gray-200 focus:border-primary-500 focus:ring-primary-500/10
```

---

### SelectField

**Файл**: `components/SelectField.tsx`

Выпадающий список с кастомной стрелкой.

```typescript
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: boolean;
}
```

**Особенности**:
- Нативный `<select>` для мобильной совместимости
- Кастомная стрелка через SVG
- Те же стили ошибок, что и у InputField

---

### ToneSelector

**Файл**: `components/ToneSelector.tsx`

Сетка выбора тона текста (5 вариантов).

```typescript
interface ToneSelectorProps {
  selectedTone: Tone;
  onChange: (tone: Tone) => void;
}
```

**Варианты тонов**:
| ID | Лейбл | Иконка | Описание |
|----|-------|--------|----------|
| `aggressive` | Продающий | Zap | Энергичный, напористый |
| `polite` | Вежливый | Coffee | Дружелюбный, уважительный |
| `brief` | Краткий | FileText | Лаконичный, по делу |
| `restrained` | Сдержанный | Scale | Спокойный, объективный |
| `natural` | Человечный | MessageCircle | Разговорный, неформальный |

**Layout**: Grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`
- Последний элемент на mobile занимает 2 колонки (`col-span-2 sm:col-span-1`)

---

### ImageUpload

**Файл**: `components/ImageUpload.tsx`

Загрузка изображений с превью.

```typescript
interface ImageUploadProps {
  image: string | undefined;
  onImageChange: (image: string) => void;
}
```

**Особенности**:
- Drag & drop через нативный input
- Проверка размера (max 4MB)
- Конвертация в base64 через FileReader
- Превью с кнопкой удаления
- Hover эффекты на загрузке

**Использование**:
```tsx
<ImageUpload 
  image={state.formData.electronics.image}
  onImageChange={(img) => updateFormData('image', img)}
/>
```

---

### RulesModal

**Файл**: `components/RulesModal.tsx`

Модальное окно с правилами и тарифами.

```typescript
interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Содержание**:
1. **Стоимость действий** (3 карточки):
   - Текст объявления: 1 кредит
   - Анализ фото + Текст: 2 кредита
   - SEO Оптимизация: 1 кредит

2. **Пакеты пополнения**:
   - Starter: 10 кредитов / 99₽
   - Seller: 50 кредитов / 390₽ (Популярный)
   - Pro Business: 300 кредитов + Bulk API / 1,490₽

3. **Условия использования**

**Анимации**:
- Backdrop: `bg-black/60 backdrop-blur-sm animate-in fade-in`
- Modal: `rounded-3xl shadow-2xl`

---

## Layout компоненты

### RootLayout

**Файл**: `app/layout.tsx`

Корневой layout приложения.

**Содержит**:
- SEO метаданные (title, description, keywords, OG, Twitter)
- Google Analytics Script (conditional)
- Header с навигацией
- Footer
- Theme provider (class-based)

**Навигация**:
```
Logo ──────────────────────── Features | Pricing | Blog | [Try the app]
```

**Метаданные**:
- Title: "AI Classifieds Ad Generator"
- Description: SEO-optimized SaaS for classified ads
- Keywords: AI ad generator, Avito, OLX, Youla, classifieds copywriting

### Home Page

**Файл**: `app/page.tsx`

Landing страница с:
- Hero секцией
- JSON-LD структурированными данными
- CTA кнопками
- Feature highlights

**JSON-LD Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Classifieds Ad Generator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "price": "0", "priceCurrency": "USD" }
}
```

---

## Styling Patterns

### Tailwind классы (светлая тема)

```typescript
// Карточка
'bg-white rounded-3xl shadow-xl border border-gray-100'

// Кнопка primary
'bg-primary-600 text-white hover:bg-primary-700'

// Кнопка secondary
'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'

// Заголовок
'text-3xl font-bold tracking-tight text-gray-900'

// Подзаголовок
'text-lg text-gray-600'
```

### Tailwind классы (тёмная тема)

Все компоненты используют dark: префиксы:
```typescript
'bg-white dark:bg-gray-800'
'text-gray-900 dark:text-white'
'border-gray-200 dark:border-gray-700'
'hover:bg-gray-50 dark:hover:bg-gray-750'
```

### Цветовая палитра (Primary)

Tailwind config расширяет стандартные цвета:
```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#eff6ff',   // 50
    100: '#dbeafe',  // 100
    // ... до 900
    600: '#2563eb',  // Основной
    700: '#1d4ed8',  // Hover
  }
}
```

---

## Animation Patterns

```typescript
// Fade in
'animate-in fade-in duration-300'

// Slide in
'animate-in slide-in-from-bottom-2'

// Scale on hover
'hover:scale-[1.02] transition-transform'

// Loading spinner
'animate-spin rounded-full h-12 w-12 border-b-2'

// Pulse (selected indicator)
'animate-ping absolute inline-flex h-full w-full rounded-full'
```

---

## Accessibility

### Keyboard Navigation
- Все интерактивные элементы фокусируемы
- `focus:outline-none focus-visible:ring-4`
- Tab order соответствует визуальному порядку

### ARIA
- Модальные окна: `z-50`, backdrop click to close
- Иконки с `aria-hidden` или `title`
- Кнопки с четкими label

### Color Contrast
- Все тексты соответствуют WCAG AA
- Основной текст: `text-gray-900` (чёрный)
- Вторичный текст: `text-gray-600`
- Ошибки: `text-red-600` на `bg-red-50`
