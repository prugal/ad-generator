import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export const metadata: Metadata = {
    title: 'Оплата успешна — ProfitText.AI',
    description: 'Ваш платёж успешно обработан. Кредиты зачислены на ваш счёт.',
    robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
    return (
        <>
            <Header />
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
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Кредиты зачислены на ваш счёт. Вы можете начать создавать продающие объявления прямо сейчас.
                    </p>

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
            <Footer />
        </>
    );
}
