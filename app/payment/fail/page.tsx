import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export const metadata: Metadata = {
    title: 'Ошибка оплаты — AdGenius.AI',
    description: 'Произошла ошибка при обработке платежа. Попробуйте снова или свяжитесь с поддержкой.',
    robots: { index: false, follow: false },
};

export default function PaymentFailPage() {
    return (
        <>
            <Header />
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
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        Платёж не был обработан. Средства не были списаны с вашего счёта.
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
            <Footer />
        </>
    );
}
