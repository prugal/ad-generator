/**
 * Yandex.Metrika service
 * Базовые функции для работы с Метрикой
 */

const COUNTER_ID = 108250247;

declare global {
  interface Window {
    ym?: (counterId: number, command: string, ...args: any[]) => void;
  }
}

/**
 * Проверка доступности Метрики
 */
export function isMetrikaAvailable(): boolean {
  return typeof window.ym !== 'undefined';
}

/**
 * Отправка хита (просмотра страницы)
 */
export function hit(url?: string): void {
  if (isMetrikaAvailable()) {
    window.ym!(COUNTER_ID, 'hit', url || window.location.href);
  }
}

/**
 * Отправка цели
 * @param targetName Имя цели (как задано в настройках Метрики)
 * @param params Дополнительные параметры (опционально)
 */
export function goal(targetName: string, params?: Record<string, any>): void {
  if (isMetrikaAvailable()) {
    window.ym!(COUNTER_ID, 'reachGoal', targetName, params);
  }
}

/**
 * Отправка события (ecommerce, клики и т.д.)
 */
export function event(eventName: string, eventData?: Record<string, any>): void {
  if (isMetrikaAvailable()) {
    window.ym!(COUNTER_ID, 'extLink', eventName, eventData);
  }
}

/**
 * Установка идентификатора пользователя (для авторизованных пользователей)
 */
export function setUserParams(params: { email?: string; name?: string }): void {
  if (isMetrikaAvailable()) {
    window.ym!(COUNTER_ID, 'userParams', params);
  }
}

/**
 * Инициализация Метрики (вызывается один раз при загрузке)
 */
export function init(): void {
  // Инициализация происходит через Script в компоненте
  // Эта функция нужна только если требуется кастомная инициализация
}
