
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from '@/hooks/useAuth';
import { AuthInitializer } from '@/components/AuthInitializer';
import ScrollToTop from "../components/ScrollToTop";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "AI Генератор Объявлений | Создать описание для Авито и Юлы",
  description: "Бесплатный генератор продающих описаний для объявлений с помощью искусственного интеллекта. Загрузите фото, укажите характеристики и получите готовый текст для Avito, Youla за 2 секунды.",
  keywords: ["генератор объявлений", "описание для авито", "AI копирайтинг", "нейросеть для продаж", "ChatGPT для авито", "продающий текст", "шаблон объявления"],
  openGraph: {
    title: "AI Генератор Объявлений",
    description: "Создайте идеальное описание товара за пару секунд с помощью AI.",
    type: "website",
    locale: "ru_RU",
    siteName: "AI Classifieds Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Генератор Объявлений",
    description: "Продавайте быстрее с умными описаниями.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const THEME_KEY = 'profit-text-theme';
                try {
                  const savedTheme = localStorage.getItem(THEME_KEY);
                  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108250247', 'ym');

              ym(108250247, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        {/* /Yandex.Metrika counter */}
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        <noscript>
          <div style={{ position: 'absolute', left: '-9999px' }}>
            <img src="https://mc.yandex.ru/watch/108250247" alt="Yandex.Metrika" />
          </div>
        </noscript>
        <AuthProvider>
          <AuthInitializer>
            <ScrollToTop />
            {children}
          </AuthInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
