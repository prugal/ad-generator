import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ContactForm from '../../components/ContactForm';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Контакты — ProfitText.AI | Связаться с нами',
    description: 'Свяжитесь с командой ProfitText.AI. Поддержка, вопросы по оплате, сотрудничество. Телефон, email, форма обратной связи.',
    robots: { index: true, follow: true },
};

export default function ContactsPage() {
    return (
        <>
            <Header />
            <main className="pt-24 pb-16 bg-white dark:bg-gray-900 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">← На главную</Link>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Свяжитесь с нами
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Мы всегда готовы помочь! Напишите нам через форму или используйте контактные данные ниже.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
                        {/* Contact info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Email */}
                            <div className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email</h3>
                                <a href="mailto:rugal.pavel@yandex.ru" className="text-blue-600 hover:underline text-sm">
                                    rugal.pavel@yandex.ru
                                </a>
                                <p className="text-xs text-gray-500 mt-1">Ответим в течение 24 часов</p>
                            </div>

                            {/* Phone */}
                            <div className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Телефон</h3>
                                <a href="tel:+79059155559" className="text-blue-600 hover:underline text-sm">
                                    +7 905 915-55-59
                                </a>
                                <p className="text-xs text-gray-500 mt-1">Пн-Пт, 10:00–19:00 (МСК)</p>
                            </div>

                            {/* Company details */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-800/40 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Реквизиты</h3>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p><span className="text-gray-500 dark:text-gray-500">Наименование:</span> Ругаль Павел Николаевич</p>
                                    <p><span className="text-gray-500 dark:text-gray-500">ИНН:</span> 420525000910</p>
                                    <p><span className="text-gray-500 dark:text-gray-500">ОГРНИП:</span> 324420500058634</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact form */}
                        <div className="lg:col-span-3">
                            <div className="p-6 sm:p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Форма обратной связи</h2>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
