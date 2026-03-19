"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../services/authStore';

export default function PaymentSuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { initializeAuth } = useAuthStore();
    const [isRestoring, setIsRestoring] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    // Сессии нет, пробуем восстановить
                    console.log('No session found, attempting to restore...');
                }

                // Инициализируем хранилище auth
                await initializeAuth();
            } catch (err) {
                console.error('Failed to restore session:', err);
                setError('Не удалось восстановить сессию. Войдите снова.');
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

    return (
        <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen flex items-center">
            <div className="max-w-xl mx-auto px-4 text-center">
                {/* Success icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-bounce">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Оплата прошла успешно!
                </h1>

                {invId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Номер платежа: <span className="font-mono">{invId}</span>
                    </p>
                )}

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Кредиты зачислены на ваш счёт. Вы можете начать создавать продающие объявления прямо сейчас.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/generator"
                        id="success-cta"
                        className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                    >
                        Создать объявление
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </main>
    );
}
