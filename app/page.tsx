'use client';

import React, { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PricingCard from '../components/PricingCard';
import { OrganizationSchema, WebSiteSchema, FAQSchema, ServiceSchema } from '../components/SchemaOrg';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have a useAuth hook

// Metadata can not be used in a client component. 
// We can move it to a layout or a higher-level server component if needed.
/*
export const metadata: Metadata = {
  title: 'AI Генератор Объявлений для Авито и Юла | Нейросеть для продающих описаний — ProfitText.AI',
  description:
    'Бесплатный генератор продающих описаний для объявлений с помощью ИИ. Загрузите фото, укажите характеристики — получите готовый текст для Авито, Юла, OLX за считанные секунды. Экономьте время — продавайте быстрее!',
  keywords: [
    'генератор объявлений',
    'описание для авито',
    'AI копирайтинг',
    'нейросеть для продаж',
    'ChatGPT для авито',
    'продающий текст',
    'шаблон объявления',
    'генератор текста для юла',
    'автоматическое описание товара',
    'AI объявление бесплатно',
    'создать объявление онлайн',
    'текст для доски объявлений',
  ],
  openGraph: {
    title: 'AI Генератор Объявлений — Создайте описание за считанные секунды',
    description: 'Продающие описания для Авито и Юла с помощью ИИ. Бесплатные кредиты при регистрации.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ProfitText.AI',
    url: 'https://profit-text.ru',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Генератор Объявлений — ProfitText.AI',
    description: 'Продавайте быстрее с умными описаниями от ИИ.',
  },
  alternates: {
    canonical: 'https://profit-text.ru',
  },
};
*/

const faqData = [
  {
    question: 'Как работает AI генератор объявлений?',
    answer:
      'Вы выбираете категорию товара, заполняете характеристики (модель, состояние, цена) и нажимаете "Создать". Нейросеть анализирует данные и создаёт продающее описание, оптимизированное для Авито, Юла и других площадок.',
  },
  {
    question: 'Сколько стоит генерация одного объявления?',
    answer:
      'Одна генерация стоит 1 кредит. При регистрации вы получаете 3 бесплатных кредита. Дополнительные кредиты можно приобрести от 99 ₽ за пакет.',
  },
  {
    question: 'Какие площадки поддерживаются?',
    answer:
      'Генератор создаёт описания, подходящие для всех популярных площадок: Авито, Юла, Дром и другие русскоязычные доски объявлений.',
  },
  {
    question: 'Можно ли редактировать сгенерированный текст?',
    answer:
      'Да, после генерации текст доступен для редактирования. Вы также можете нажать "Оптимизировать", чтобы ИИ улучшил и дополнил описание.',
  },
  {
    question: 'Как оплатить кредиты?',
    answer:
      'Оплата производится через безопасную платёжную систему Robokassa. Принимаются карты МИР, СБП и другие способы оплаты.',
  },
  {
    question: 'Можно ли вернуть деньги?',
    answer:
      'Да, вы можете запросить возврат неиспользованных кредитов в течение 14 дней с момента оплаты. Подробнее — на странице "Возврат средств".',
  },
];

const steps = [
  {
    num: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Выберите категорию',
    desc: 'Электроника, авто, услуги или одежда — выберите подходящую категорию для вашего товара.',
  },
  {
    num: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    title: 'Заполните данные',
    desc: 'Укажите модель, состояние, цену и другие характеристики. Можно добавить фото для анализа.',
  },
  {
    num: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Получите результат',
    desc: 'ИИ создаст продающее описание за считанные секунды. Копируйте и размещайте на любой площадке.',
  },
];

const stats = [
  { value: '5 200+', label: 'объявлений создано за всё время' },
  { value: '3 сек', label: 'среднее время генерации текста' },
  { value: '95%', label: 'пользователей довольны результатом' },
  { value: '1 800+', label: 'активных пользователей сервиса' },
];

export default function HomePage() {
  const { user, session } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!user) {
        // Or redirect to login
        setError('Пожалуйста, войдите в систему, чтобы совершить покупку.');
        // You might want to show a login modal here
        return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
        const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                planId, 
                userId: user.id,
                email: user.email 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Не удалось создать платеж.');
        }

        // Redirect to Robokassa
        window.location.href = data.paymentUrl;

    } catch (err: any) {
        console.error('Purchase error:', err);
        setError(err.message || 'Произошла неизвестная ошибка.');
    } finally {
        setLoadingPlan(null);
    }
  };

  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <ServiceSchema
        name="AI Генератор объявлений"
        description="Автоматическое создание продающих описаний для досок объявлений с помощью искусственного интеллекта"
        price="99"
      />
      <FAQSchema questions={faqData} />

      <Header />

      <main>
        {/* ===== HERO ===== */}
        <section
          id="hero"
          className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        >
          {/* Decorative blobs */}
          <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Создавайте объявления с помощью ИИ
              </div>

              {/* Heading h1 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                Создайте{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  продающее объявление
                </span>{' '}
                за считанные секунды
              </h1>

              {/* Sub */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                AI-генератор описаний для{' '}
                <strong className="text-gray-900 dark:text-white">Авито</strong>,{' '}
                <strong className="text-gray-900 dark:text-white">Юла</strong> и других площадок.
                Загрузите фото, укажите характеристики — и получите готовый текст, который продаёт.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  href="/generator"
                  id="hero-cta-primary"
                  className="group relative px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Попробовать бесплатно
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </Link>
                <a
                  href="#how-it-works"
                  id="hero-cta-secondary"
                  className="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1"
                >
                  Как это работает?
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Как создать объявление с помощью{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ИИ</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Три простых шага — и у вас готовое продающее описание для любой площадки
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/5"
                >
                  <div className="absolute top-6 right-6 text-5xl font-black text-gray-100 dark:text-gray-800 group-hover:text-blue-100 dark:group-hover:text-blue-900/50 transition-colors">
                    {step.num}
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ADVANTAGES ===== */}
        <section id="advantages" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Почему выбирают{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ProfitText.AI</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Мощная нейросеть, заточенная под российские площадки объявлений
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '⚡',
                  title: 'Мгновенная генерация',
                  desc: 'Получайте продающий текст за считанные секунды. Никакого ожидания — AI работает молниеносно.',
                },
                {
                  icon: '🎯',
                  title: 'Оптимизация под площадки',
                  desc: 'Описания создаются с учётом алгоритмов Авито, Юла, OLX для максимальной видимости.',
                },
                {
                  icon: '📸',
                  title: 'Анализ фотографий',
                  desc: 'Загрузите фото товара — ИИ проанализирует изображение и учтёт детали в описании.',
                },
                {
                  icon: '🎨',
                  title: '5 тонов общения',
                  desc: 'Агрессивный, вежливый, краткий, сдержанный или естественный — подберите стиль под задачу.',
                },
                {
                  icon: '✏️',
                  title: 'Редактирование и оптимизация',
                  desc: 'Редактируйте результат или попросите AI улучшить текст одним нажатием.',
                },
                {
                  icon: '🔒',
                  title: 'Безопасные платежи',
                  desc: 'Оплата через Robokassa — поддержка МИР, СБП и других методов.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Простые и прозрачные{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">тарифы</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Выберите подходящий пакет кредитов. Каждый кредит = одна генерация объявления.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard
                planId="start"
                name="Старт"
                price="99 ₽"
                credits="15 кредитов"
                features={[
                  '15 генераций объявлений',
                  'Все категории товаров',
                  '5 тонов описания',
                  'Оптимизация текста',
                  'Загрузка фото',
                ]}
                ctaText="Купить 15 кредитов"
                onClick={handlePurchase}
                isLoading={loadingPlan === 'start'}
              />
              <PricingCard
                planId="pro"
                name="Профи"
                price="390 ₽"
                priceNote="/ экономия 35%"
                credits="60 кредитов"
                recommended
                features={[
                  '60 генераций объявлений',
                  'Все категории товаров',
                  '5 тонов описания',
                  'Оптимизация текста',
                  'Загрузка фото',
                  'Приоритетная генерация',
                ]}
                ctaText="Купить 60 кредитов"
                onClick={handlePurchase}
                isLoading={loadingPlan === 'pro'}
              />
              <PricingCard
                planId="business"
                name="Бизнес"
                price="990 ₽"
                priceNote="/ экономия 45%"
                credits="200 кредитов"
                features={[
                  '200 генераций объявлений',
                  'Все категории товаров',
                  '5 тонов описания',
                  'Оптимизация текста',
                  'Загрузка фото',
                  'Приоритетная генерация',
                  'Email-поддержка',
                ]}
                ctaText="Купить 200 кредитов"
                onClick={handlePurchase}
                isLoading={loadingPlan === 'business'}
              />
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
              Безопасная оплата через Robokassa. Принимаем МИР, СБП.
              <br />
              <Link href="/refund" className="text-blue-600 hover:underline">Условия возврата</Link>
              {' · '}
              <Link href="/offer" className="text-blue-600 hover:underline">Публичная оферта</Link>
            </p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Часто задаваемые{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">вопросы</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqData.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none text-left font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.question}
                    <svg
                      className="w-5 h-5 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section id="final-cta" className="py-20 lg:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-40" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
              Начните продавать быстрее{' '}
              <span className="text-blue-200">уже сегодня</span>
            </h2>
            <p className="text-lg text-blue-100/80 max-w-2xl mx-auto mb-10">
              Присоединяйтесь к 5 200+ продавцов, которые уже используют ИИ для создания объявлений.
              3 бесплатных кредита при регистрации!
            </p>
            <Link
              href="/generator"
              id="final-cta-button"
              className="inline-flex items-center gap-2 px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-2xl shadow-2xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300"
            >
              Создать объявление бесплатно
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
