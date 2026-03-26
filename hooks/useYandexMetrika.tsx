"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { hit } from "@/services/yandex-metrika";

/**
 * Хук для автоматического отслеживания переходов между страницами
 * Отправляет хит при каждом изменении pathname или searchParams
 */
export function useYandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    hit(window.location.href);
  }, [pathname, searchParams]);
}

function YandexMetrikaContent() {
  useYandexMetrika();
  return null;
}

/**
 * Компонент-обёртка для безопасного использования хука
 * Требуется для работы с Suspense в Next.js
 */
export function YandexMetrikaProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null} >
      <YandexMetrikaContent />
      {children}
    </Suspense>
  );
}