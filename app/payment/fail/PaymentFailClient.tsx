"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../services/authStore';

const errorMessages: Record<string, string> = {
    'invalid-signature': 'Ошибка проверки подписи платежа. Это может означать проблему с настройками платежной системы.',
    'missing-params': 'Отсутствуют необходимые параметры платежа.',
    'internal-error': 'Внутренняя ошибка сервера при обработке платежа.',
};

export default function PaymentFailClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { initializeAuth } = useAuthStore();
    const [isRestoring, setIsRestoring] = useState(true);

    const reason = searchParams?.get('reason') || null;
    const invId = searchParams?.get('invId') || null;

    useEffect(() => {
        const restoreSession = async () => {
            try {
                // Проверка существующей сессии
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error getting session:', sessionError);
                }

                if (!session) {
                    console.log('No session found, attempting to restore...');
                }

                // Инициализируем хранилище auth
                await initializeAuth();
            } catch (err) {
                console.error('Failed to restore session:', err);
            } finally {
                setIsRestoring(false);
            }
        };

        restoreSession();
    }, [initializeAuth]);

    if (isRestoring) {
        return (
            <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen flex items-center">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Восстановление сессии...</p>
                </div>
            </main>
        );
    }

    const errorMessage = reason ? (errorMessages[reason] || `Ошибка оплаты: ${reason}`) : 'Платёж не был обработан';

    return (
        <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen flex items-center">
            <div className="max-w-xl mx-auto px-4 text-center">
                {/* Error icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Оплата не удалась
                </h1>

                {invId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Номер платежа: <span className="font-mono">{invId}</span>
                    </p>
                )}

                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-base text-red-700 dark:text-red-400 font-medium mb-2">
                        {errorMessage}
                    </p>
                    {reason === 'invalid-signature' && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            Если вы видите эту ошибку, пожалуйста, сообщите в поддержку с указанием номера платежа.
                        </p>
                    )}
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Средства не были списаны с вашего счёта.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    Если проблема повторяется, попробуйте другой способ оплаты или свяжитесь с нашей поддержкой.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/#pricing"
                        id="fail-retry-cta"
                        className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                    >
                        Попробовать снова
                    </Link>
                    <Link
                        href="/contacts"
                        className="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        Связаться с поддержкой
                    </Link>
                </div>
            </div>
        </main>
    );
}
