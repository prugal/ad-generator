"use client";

import { useEffect } from "react";
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
