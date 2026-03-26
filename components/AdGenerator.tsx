'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Smartphone, Car, Briefcase, Shirt, Sparkles, Copy, RefreshCw, CheckCircle2, TrendingUp, Tag, Share2, X, LinkIcon, AlertTriangle, Lightbulb, Info, Pencil, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryId, AppState, LlmProvider } from '../types';
import { CategoryCard } from './CategoryCard';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { ToneSelector } from './ToneSelector';
import { ImageUpload } from './ImageUpload';
import { RulesModal } from './RulesModal';
import { generateAd, optimizeAdWithKeywords } from '../services/geminiService';
import AuthButton from './AuthButton';
import { useCreditStore } from '@/services/creditStore';
import { creditService } from '@/services/creditService';
import { useAuthStore } from '@/services/authStore';
import { ProviderSelector } from './ProviderSelector';

// Initial state helpers
const initialElectronics = { model: '', specs: '', condition: 'normal' as const, kit: '', image: '', price: '' };
const initialAuto = { makeModel: '', year: '', mileage: '', nuances: '', price: '' };
const initialServices = { serviceType: '', experience: '', benefit: '', price: '' };
const initialClothing = { type: '', size: '', condition: '', brand: '', image: '', price: '' };

const STORAGE_KEY = 'ai_ads_app_state_v1';

// Helper to clean up double escaped newlines sometimes returned by AI in JSON
const cleanTextResponse = (text: string): string => {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
};

export default function AdGenerator() {
  const { balance, setBalance } = useCreditStore();
  const { user, isInitialized } = useAuthStore();

  const [showRules, setShowRules] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize state
  const [state, setState] = useState<AppState>({
    category: 'electronics',
    tone: 'polite',
    llmProvider: 'gemini',
    formData: {
      electronics: { ...initialElectronics },
      auto: { ...initialAuto },
      services: { ...initialServices },
      clothing: { ...initialClothing },
    },
    generatedText: '',
    smartTip: null,
    keywords: [],
    isLoading: false,
    isOptimizing: false,
    error: null,
    validationErrors: {},
  });

  // Track previous user to detect account changes/logout
  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Initial load: set the current user ID
    if (prevUserId.current === undefined) {
      if (user !== undefined) {
        prevUserId.current = user?.id || null;
      }
      return;
    }

    // If user changed (logout or account switch)
    if (user?.id !== prevUserId.current) {
      // Clear state only if we had a user before (logout or switch)
      // This allows guest -> login transition without losing data
      if (prevUserId.current !== null) {
        setState(prev => ({
          ...prev,
          formData: {
            electronics: { ...initialElectronics },
            auto: { ...initialAuto },
            services: { ...initialServices },
            clothing: { ...initialClothing },
          },
          generatedText: '',
          smartTip: null,
          keywords: [],
          error: null,
          validationErrors: {},
        }));
        localStorage.removeItem(STORAGE_KEY);
      }
      prevUserId.current = user?.id || null;
    }
  }, [user?.id]);

  // Load credits when user changes
  useEffect(() => {
    const loadCredits = async () => {
      if (user) {
        try {
          const data = await creditService.getCredits();
          console.log('Loaded credits data:', data);
          // The RPC returns { credits: { balance: ... }, transactions: [...] }
          // or sometimes just { balance: ... } depending on the version
          const balanceValue = data?.credits?.balance ?? data?.balance;
          console.log('Extracted balance:', balanceValue);
          if (typeof balanceValue === 'number') {
            setBalance(balanceValue);
          }
        } catch (error) {
          console.error('Failed to load credits:', error);
        }
      } else {
        setBalance(0);
      }
    };
    loadCredits();
  }, [user, setBalance]);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          category: parsed.category || 'electronics',
          tone: parsed.tone || 'polite',
          llmProvider: parsed.llmProvider || 'gemini',
          formData: {
            electronics: { ...initialElectronics, ...parsed.formData?.electronics },
            auto: { ...initialAuto, ...parsed.formData?.auto },
            services: { ...initialServices, ...parsed.formData?.services },
            clothing: { ...initialClothing, ...parsed.formData?.clothing },
          },
          generatedText: parsed.generatedText || '',
          smartTip: parsed.smartTip || null,
          keywords: parsed.keywords || [],
        }));
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
  }, []);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [optimizeModel, setOptimizeModel] = useState<'gemini-3-flash-preview' | 'gemini-flash-latest' | 'gemini-3-pro-preview'>('gemini-3-flash-preview');
  const resultRef = useRef<HTMLDivElement>(null);

  // Persistence effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const stateToSave = {
          category: state.category,
          tone: state.tone,
          llmProvider: state.llmProvider,
          formData: state.formData,
          generatedText: state.generatedText,
          smartTip: state.smartTip,
          keywords: state.keywords,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {
        // Handle quota exceeded fallback
        try {
          const cleanFormData = {
            ...state.formData,
            electronics: { ...state.formData.electronics, image: '' },
            clothing: { ...state.formData.clothing, image: '' },
          };
          const stateToSaveClean = {
            category: state.category,
            tone: state.tone,
            llmProvider: state.llmProvider,
            formData: cleanFormData,
            generatedText: state.generatedText,
            smartTip: state.smartTip,
            keywords: state.keywords,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSaveClean));
        } catch {
          // ignore
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.category, state.tone, state.llmProvider, state.formData, state.generatedText, state.smartTip, state.keywords]);

  useEffect(() => {
    if (state.generatedText && !state.isLoading && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.generatedText, state.isLoading]);

  const handleCategoryChange = (id: CategoryId) => {
    setState(prev => ({
      ...prev,
      category: id,
      generatedText: '',
      smartTip: null,
      keywords: [],
      error: null,
      validationErrors: {}
    }));
  };

  const updateFormData = (field: string, value: string) => {
    setState(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        [field]: false
      },
      formData: {
        ...prev.formData,
        [prev.category]: {
          ...prev.formData[prev.category],
          [field]: value
        }
      }
    }));
  };

  const validateForm = (): boolean => {
    const { category, formData } = state;
    const errors: Record<string, boolean> = {};
    const data = formData[category];

    switch (category) {
      case 'electronics': {
        const d = data as typeof initialElectronics;
        if (!d.model.trim()) errors.model = true;
        if (!d.specs.trim()) errors.specs = true;
        break;
      }
      case 'auto': {
        const d = data as typeof initialAuto;
        if (!d.makeModel.trim()) errors.makeModel = true;
        if (!d.year.toString().trim()) errors.year = true;
        if (!d.mileage.toString().trim()) errors.mileage = true;
        break;
      }
      case 'services': {
        const d = data as typeof initialServices;
        if (!d.serviceType.trim()) errors.serviceType = true;
        if (!d.experience.trim()) errors.experience = true;
        if (!d.benefit.trim()) errors.benefit = true;
        break;
      }
      case 'clothing': {
        const d = data as typeof initialClothing;
        if (!d.type.trim()) errors.type = true;
        if (!d.size.trim()) errors.size = true;
        if (!d.condition.trim()) errors.condition = true;
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        validationErrors: errors,
        error: 'Пожалуйста, заполните выделенные обязательные поля.'
      }));
      return false;
    }

    return true;
  };

  const handleGenerate = async (isRegeneration = false) => {

    const cost = isRegeneration ? 0.5 : 1;

    if (balance < cost) {
      setState(prev => ({ ...prev, error: `Недостаточно кредитов. Нужно ${cost} кредит(а).` }));
      return;
    }

    if (!validateForm()) return;

    setIsEditing(false);
    setState(prev => ({ ...prev, isLoading: true, error: null, generatedText: '', smartTip: null, keywords: [] }));

    try {
      const currentData = state.formData[state.category];
      const { adText, smartTip } = await generateAd(state.category, state.tone, currentData, state.llmProvider);

      // Списываем кредиты только после успешной генерации
      await creditService.spendCredits(cost, isRegeneration ? 'Ad Regeneration' : 'Ad Generation');
      setBalance(balance - cost);

      setState(prev => ({ ...prev, isLoading: false, generatedText: cleanTextResponse(adText), smartTip: cleanTextResponse(smartTip) }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Something went wrong'
      }));
    }
  };

  const handleGenerateClick = () => {
    if (state.generatedText) {
      setShowConfirmModal(true);
    } else {
      handleGenerate(false);
    }
  };

  const confirmGenerate = () => {
    setShowConfirmModal(false);
    handleGenerate(true); // повторная генерация — 0.5 кредита
  };

  const handleOptimize = async () => {
    if (balance < 1) {
      setState(prev => ({ ...prev, error: 'Недостаточно кредитов для SEO оптимизации.' }));
      return;
    }

    if (!state.generatedText) return;

    setState(prev => ({ ...prev, isOptimizing: true, error: null }));

    try {
      const currentData = state.formData[state.category];
      const { adText, keywords } = await optimizeAdWithKeywords(
        state.generatedText,
        state.category,
        currentData,
        optimizeModel,
        state.llmProvider
      );

      // Списываем кредиты только после успешной оптимизации
      await creditService.spendCredits(1, 'Ad Optimization');
      setBalance(balance - 1);

      const cleanedAdText = cleanTextResponse(adText);
      const fullText = `${cleanedAdText.trim()}\n\n🔍 Теги для поиска: ${keywords.join(', ')}`;

      setState(prev => ({
        ...prev,
        isOptimizing: false,
        generatedText: fullText,
        keywords: keywords
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: err instanceof Error ? err.message : 'Optimization failed'
      }));
    }
  };

  const handleCopy = () => {
    if (state.generatedText) {
      navigator.clipboard.writeText(state.generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator?.share === 'function') {
      try {
        await navigator.share({
          title: 'Продающее объявление',
          text: state.generatedText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const renderForm = () => {
    switch (state.category) {
      case 'electronics':
        return (
          <>
            <InputField
              label="Название модели"
              placeholder="Например: iPhone 13 Pro 256GB, Sony PlayStation 5"
              value={state.formData.electronics.model}
              onChange={(v) => updateFormData('model', v)}
              error={state.validationErrors.model}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Цена (₽)"
                placeholder="Необязательно"
                value={state.formData.electronics.price || ''}
                onChange={(v) => updateFormData('price', v)}
              />
              <SelectField
                label="Состояние"
                value={state.formData.electronics.condition}
                onChange={(v) => updateFormData('condition', v)}
                options={[
                  { value: 'ideal', label: 'Идеальное (как новое)' },
                  { value: 'normal', label: 'Нормальное (есть следы)' },
                  { value: 'broken', label: 'На запчасти / разбито' },
                ]}
                error={state.validationErrors.condition}
              />
            </div>
            <InputField
              label="Память / Характеристики"
              placeholder="Цвет, память, процессор (напр: Графит, 256ГБ, АКБ 87%)"
              value={state.formData.electronics.specs}
              onChange={(v) => updateFormData('specs', v)}
              error={state.validationErrors.specs}
            />
            <InputField
              label="Комплект"
              placeholder="Коробка, зарядка, чек, гарантия, чехол в подарок..."
              value={state.formData.electronics.kit}
              onChange={(v) => updateFormData('kit', v)}
              error={state.validationErrors.kit}
            />
            <ImageUpload
              image={state.formData.electronics.image}
              onImageChange={(img) => updateFormData('image', img)}
            />
          </>
        );
      case 'auto':
        return (
          <>
            <InputField
              label="Марка / Модель"
              placeholder="Например: Toyota Camry, Hyundai Solaris, BMW X5"
              value={state.formData.auto.makeModel}
              onChange={(v) => updateFormData('makeModel', v)}
              error={state.validationErrors.makeModel}
            />
            <InputField
              label="Цена (₽)"
              placeholder="Необязательно"
              value={state.formData.auto.price || ''}
              onChange={(v) => updateFormData('price', v)}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Год выпуска"
                placeholder="2018"
                type="number"
                value={state.formData.auto.year}
                onChange={(v) => updateFormData('year', v)}
                error={state.validationErrors.year}
              />
              <InputField
                label="Пробег (км)"
                placeholder="145000"
                type="number"
                value={state.formData.auto.mileage}
                onChange={(v) => updateFormData('mileage', v)}
                error={state.validationErrors.mileage}
              />
            </div>
            <InputField
              label="Нюансы по кузову / технике"
              placeholder="Не бита, не крашена, есть сколы на капоте, требует замены масла..."
              type="textarea"
              value={state.formData.auto.nuances}
              onChange={(v) => updateFormData('nuances', v)}
              error={state.validationErrors.nuances}
            />
          </>
        );
      case 'services':
        return (
          <>
            <InputField
              label="Вид услуги"
              placeholder="Например: Ремонт стиральных машин, Репетитор по математике"
              value={state.formData.services.serviceType}
              onChange={(v) => updateFormData('serviceType', v)}
              error={state.validationErrors.serviceType}
            />
            <InputField
              label="Цена / Ставка (₽)"
              placeholder="Необязательно"
              value={state.formData.services.price || ''}
              onChange={(v) => updateFormData('price', v)}
            />
            <InputField
              label="Опыт работы"
              placeholder="Более 10 лет, Высшее образование, Сотни довольных клиентов..."
              value={state.formData.services.experience}
              onChange={(v) => updateFormData('experience', v)}
              error={state.validationErrors.experience}
            />
            <InputField
              label="Главное преимущество"
              placeholder="Работаю без предоплаты, Выезд в течение часа, Гарантия 1 год..."
              type="textarea"
              value={state.formData.services.benefit}
              onChange={(v) => updateFormData('benefit', v)}
              error={state.validationErrors.benefit}
            />
          </>
        );
      case 'clothing':
        return (
          <>
            <InputField
              label="Тип вещи"
              placeholder="Например: Пуховик, Вечернее платье, Кроссовки..."
              value={state.formData.clothing.type}
              onChange={(v) => updateFormData('type', v)}
              error={state.validationErrors.type}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Цена (₽)"
                placeholder="Необязательно"
                value={state.formData.clothing.price || ''}
                onChange={(v) => updateFormData('price', v)}
              />
              <InputField
                label="Бренд"
                placeholder="Zara, Nike, H&M..."
                value={state.formData.clothing.brand}
                onChange={(v) => updateFormData('brand', v)}
                error={state.validationErrors.brand}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Размер"
                placeholder="S (42-44), 38 EUR, Рост 170..."
                value={state.formData.clothing.size}
                onChange={(v) => updateFormData('size', v)}
                error={state.validationErrors.size}
              />
              <InputField
                label="Состояние"
                placeholder="Новое с биркой, б/у..."
                value={state.formData.clothing.condition}
                onChange={(v) => updateFormData('condition', v)}
                error={state.validationErrors.condition}
              />
            </div>
            <ImageUpload
              image={state.formData.clothing.image}
              onImageChange={(img) => updateFormData('image', img)}
            />
          </>
        );
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Генерация нового объявления</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Текущий результат будет потерян. Вы уверены, что хотите продолжить?
              </p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 p-4 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={confirmGenerate}
                className="flex-1 p-4 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Да, создать
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-8">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            На главный сайт
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowRules(true)}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              title="Правила и тарифы"
              suppressHydrationWarning
            >
              <Info className="w-5 h-5" />
            </button>
            {!isInitialized ? (
              <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ) : (
              <AuthButton />
            )}
            {user && (
              <div className="flex items-center space-x-3 text-sm font-medium">
                {(user.user_metadata?.full_name || user.email) && (
                  <span className="hidden sm:inline-block text-gray-600 dark:text-gray-300">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                )}
                <div className="flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-400">
                    {Number.isInteger(balance) ? balance : balance.toFixed(1)} кредитов
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">

          {/* Block 1: Categories */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900">
            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 ml-1">
              Шаг 1. Выберите категорию
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <CategoryCard
                id="electronics"
                label="Электроника"
                icon={Smartphone}
                isSelected={state.category === 'electronics'}
                onClick={() => handleCategoryChange('electronics')}
              />
              <CategoryCard
                id="auto"
                label="Авто"
                icon={Car}
                isSelected={state.category === 'auto'}
                onClick={() => handleCategoryChange('auto')}
              />
              <CategoryCard
                id="services"
                label="Услуги"
                icon={Briefcase}
                isSelected={state.category === 'services'}
                onClick={() => handleCategoryChange('services')}
              />
              <CategoryCard
                id="clothing"
                label="Одежда"
                icon={Shirt}
                isSelected={state.category === 'clothing'}
                onClick={() => handleCategoryChange('clothing')}
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />

          {/* Block 2: Form */}
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Шаг 2. Заполните детали
            </h2>

            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300" key={state.category}>
              {renderForm()}
              <div className="pt-2">
                <ToneSelector
                  selectedTone={state.tone}
                  onChange={(t) => {
                    setState(s => ({ ...s, tone: t }));
                  }}
                />
              </div>
              {state.llmProvider === 'gemini' && (
                <div className="flex items-center gap-3 pt-2">
                  <label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Модель для SEO:
                  </label>
                  <div className="relative flex-1">
                    <select
                      id="model-select"
                      value={optimizeModel}
                      onChange={(e) => setOptimizeModel(e.target.value as 'gemini-3-flash-preview' | 'gemini-flash-latest' | 'gemini-3-pro-preview')}
                      className="w-full appearance-none px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all pr-10"
                    >
                      <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                      <option value="gemini-flash-latest">gemini-flash-latest</option>
                      <option value="gemini-3-pro-preview">gemini-3-pro-preview</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
              <ProviderSelector
                selectedProvider={state.llmProvider}
                onChange={(provider) => setState(s => ({ ...s, llmProvider: provider }))}
              />
            </div>



            {/* Error Message */}
            {state.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                <span>⚠️</span> {state.error}
              </div>
            )}

            {/* Block 3: Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateClick}
                disabled={state.isLoading || balance < 1}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all
                  flex items-center justify-center gap-2 relative overflow-hidden group
                  ${state.isLoading || balance < 1
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 dark:from-primary-500 dark:to-indigo-500'
                  }
                `}
              >
                {state.isLoading ? (
                  <>
                    <svg suppressHydrationWarning className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle suppressHydrationWarning className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path suppressHydrationWarning className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Думаю...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    {balance < 1 ? 'Недостаточно кредитов' : 'Сгенерировать с AI'}
                  </>
                )}
              </button>
              <Link
                href="/#pricing"
                className="w-full sm:w-auto flex-shrink-0 py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                Купить кредиты
              </Link>
            </div>
          </div>
        </div>

        {/* Block 4: Result */}
        {state.generatedText && (
          <div ref={resultRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                  Готовое объявление
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-2 rounded-lg transition-colors ${isEditing
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                      }`}
                    title={isEditing ? "Закончить редактирование" : "Редактировать текст"}
                  >
                    {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleGenerateClick}
                    disabled={balance < 0.5}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Сгенерировать еще раз"
                  >
                    <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-all duration-200">
                {isEditing ? (
                  <textarea
                    value={state.generatedText}
                    onChange={(e) => setState(prev => ({ ...prev, generatedText: e.target.value }))}
                    className="w-full h-64 p-2 -m-2 bg-transparent text-gray-700 dark:text-gray-300 border border-transparent focus:border-primary-500/30 rounded-lg focus:ring-4 focus:ring-primary-500/10 resize-none font-sans text-base leading-relaxed transition-all outline-none"
                    placeholder="Введите текст объявления..."
                    autoFocus
                  />
                ) : (
                  <article className="prose prose-sm sm:prose prose-indigo dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white">
                    <ReactMarkdown>{state.generatedText}</ReactMarkdown>
                  </article>
                )}
              </div>

              {/* Smart Tip Block (Contextual Hints) */}
              {state.smartTip && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-full flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-0.5">Совет от AI:</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200/90 leading-relaxed">
                      {state.smartTip}
                    </p>
                  </div>
                </div>
              )}

              {/* Keywords Display */}
              {state.keywords.length > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">SEO Ключи (добавлены в текст):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-generation Actions Block (SEO) */}
              {!state.keywords.length && (
                <div className="mt-4">
                  <button
                    onClick={handleOptimize}
                    disabled={state.isOptimizing || balance < 1 || isEditing}
                    className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-center justify-center sm:justify-start gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      {state.isOptimizing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Прокачать SEO</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Добавить ключи для поиска</p>
                    </div>
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCopy}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200
                    ${copied
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Копировать текст
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Поделиться
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Поделиться</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => {
                    handleCopy();
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <Copy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Скопировать текст</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Сохранить в буфер обмена</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Ссылка на приложение</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{window.location.host}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
