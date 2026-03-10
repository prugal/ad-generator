'use client';

import React, { useState, useRef, useEffect } from 'react';

const subjectOptions = [
    { value: '', label: 'Выберите тему', icon: '📋' },
    { value: 'general', label: 'Общий вопрос', icon: '💬' },
    { value: 'payment', label: 'Оплата и тарифы', icon: '💳' },
    { value: 'technical', label: 'Техническая поддержка', icon: '🔧' },
    { value: 'refund', label: 'Возврат средств', icon: '💰' },
    { value: 'partnership', label: 'Сотрудничество', icon: '🤝' },
];

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectOption = (value: string) => {
        setFormData({ ...formData, subject: value });
        setIsSelectOpen(false);
    };

    const selectedOption = subjectOptions.find(opt => opt.value === formData.subject) || subjectOptions[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка отправки');
            }

            // Если API вернул mailtoLink (RESEND_API_KEY не настроен), открываем почтовый клиент
            if (data.mailtoLink) {
                window.location.href = data.mailtoLink;
            }

            setStatus('sent');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Имя <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 outline-none"
                        placeholder="Ваше имя"
                    />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 outline-none"
                        placeholder="your@email.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Тема обращения
                </label>
                <div ref={selectRef} className="relative">
                    <button
                        type="button"
                        id="contact-subject"
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 outline-none flex items-center justify-between cursor-pointer ${
                            isSelectOpen ? 'ring-2 ring-blue-500/40 border-blue-500' : ''
                        }`}
                        aria-haspopup="listbox"
                        aria-expanded={isSelectOpen}
                    >
                        <span className="flex items-center gap-2.5">
                            <span className="text-lg">{selectedOption.icon}</span>
                            <span>{selectedOption.label}</span>
                        </span>
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-out ${
                                isSelectOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Выпадающий список */}
                    <div
                        className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-300 ease-out origin-top ${
                            isSelectOpen
                                ? 'opacity-100 scale-100 translate-y-0'
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}
                        role="listbox"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {subjectOptions.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelectOption(option.value)}
                                    className={`w-full px-4 py-3 flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                                        formData.subject === option.value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-900 dark:text-white'
                                    } ${index === 0 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                                    role="option"
                                    aria-selected={formData.subject === option.value}
                                >
                                    <span className="text-lg">{option.icon}</span>
                                    <span className="flex-1 text-left">{option.label}</span>
                                    {formData.subject === option.value && (
                                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Сообщение <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 outline-none resize-none"
                    placeholder="Опишите ваш вопрос..."
                />
            </div>

            <button
                type="submit"
                disabled={status === 'sending'}
                id="contact-submit"
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Отправка...
                    </span>
                ) : 'Отправить сообщение'}
            </button>

            {status === 'sent' && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Сообщение успешно отправлено! Мы ответим в течение 24 часов.
                </div>
            )}

            {status === 'error' && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Произошла ошибка. Попробуйте ещё раз или напишите нам на rugal.pavel@yandex.ru
                </div>
            )}
        </form>
    );
}
