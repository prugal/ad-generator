import React from 'react';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const legalLinks = [
        { href: '/offer', label: 'Публичная оферта' },
        { href: '/terms', label: 'Условия использования' },
        { href: '/privacy', label: 'Политика конфиденциальности' },
        { href: '/refund', label: 'Возврат средств' },
    ];

    const navLinks = [
        { href: '/#pricing', label: 'Тарифы' },
        { href: '/#how-it-works', label: 'Как это работает' },
        { href: '/#faq', label: 'Вопросы и ответы' },
        { href: '/contacts', label: 'Контакты' },
        { href: '/generator', label: 'Генератор' },
    ];

    return (
        <footer id="site-footer" className="relative bg-gray-950 text-gray-300 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-950 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-white">
                                ProfitText
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                            Генератор продающих объявлений на базе искусственного интеллекта.
                            Создавайте идеальные описания для Авито, Юла и других площадок за секунды.
                        </p>
                        {/* Social links placeholder */}
                        <div className="flex items-center gap-3">
                            {/* <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300" aria-label="Telegram">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                            </a> */}
                            <a href="mailto:support@profit-text.ru" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300" aria-label="Email">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Навигация</h3>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Документы</h3>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company details */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Реквизиты</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p><span className="text-gray-500">Наименование:</span><br />ИП Ругаль Павел Николаевич</p>
                            <p><span className="text-gray-500">ИНН:</span> 420537607410</p>
                            <p><span className="text-gray-500">ОГРН/ОГРНИП:</span> 324420500058634</p>
                            <p><span className="text-gray-500">Email:</span> rugal.pavel@yandex.ru</p>
                        </div>
                    </div>
                </div>

                {/* Payment methods + copyright */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">
                            © {currentYear} ProfitText — Генератор объявлений на базе ИИ. Все права защищены.
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Способы оплаты:</span>
                            <div className="flex items-center gap-2">
                                <div className="px-2.5 py-1 bg-gray-800 rounded-md text-xs text-gray-400 font-medium">МИР</div>
                                <div className="px-2.5 py-1 bg-gray-800 rounded-md text-xs text-gray-400 font-medium">СБП</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
