
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "AI Генератор Объявлений | Создать описание для Авито и Юлы",
  description: "Бесплатный генератор продающих описаний для объявлений с помощью искусственного интеллекта. Загрузите фото, укажите характеристики и получите готовый текст для Avito, Youla или OLX за 2 секунды.",
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        {children}
        
        {/* Analytics Script */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
