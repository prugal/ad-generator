import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PaymentSuccessClient from './PaymentSuccessClient';

export const metadata: Metadata = {
    title: 'Оплата успешна — ProfitText.AI',
    description: 'Ваш платёж успешно обработан. Кредиты зачислены на ваш счёт.',
    robots: { index: false, follow: false },
};

function PaymentSuccessLoading() {
    return (
        <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen flex items-center">
            <div className="max-w-xl mx-auto px-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
        </main>
    );
}

export default function PaymentSuccessPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<PaymentSuccessLoading />}>
                <PaymentSuccessClient />
            </Suspense>
            <Footer />
        </>
    );
}
