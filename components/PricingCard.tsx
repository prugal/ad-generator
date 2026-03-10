'use client';

import React from 'react';
import Link from 'next/link';

interface PricingCardProps {
    name: string;
    price: string;
    priceNote?: string;
    credits: string;
    features: string[];
    recommended?: boolean;
    ctaText?: string;
    ctaHref?: string;
}

export default function PricingCard({
    name,
    price,
    priceNote,
    credits,
    features,
    recommended = false,
    ctaText = 'Выбрать тариф',
    ctaHref = '/generator',
}: PricingCardProps) {
    return (
        <div
            className={`relative h-full rounded-2xl p-[1px] transition-all duration-500 hover:-translate-y-2 ${recommended
                    ? 'bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/20'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
        >
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
                    🔥 Популярный выбор
                </div>
            )}

            <div className={`flex h-full flex-col rounded-2xl p-6 sm:p-8 ${recommended
                    ? 'bg-gray-900'
                    : 'bg-white dark:bg-gray-800'
                }`}>
                <h3 className={`text-lg font-bold mb-2 ${recommended ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                    {name}
                </h3>
                <p className={`text-sm mb-6 ${recommended ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {credits}
                </p>

                <div className="mb-6">
                    <span className={`text-4xl font-extrabold tracking-tight ${recommended
                            ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                        {price}
                    </span>
                    {priceNote && (
                        <span className={`text-sm ml-1 ${recommended ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            {priceNote}
                        </span>
                    )}
                </div>

                <ul className="mb-8 space-y-3 flex-1">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${recommended ? 'text-blue-400' : 'text-green-500'
                                }`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span className={`text-sm ${recommended ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <Link
                    href={ctaHref}
                    className={`block w-full text-center py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${recommended
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                        }`}
                >
                    {ctaText}
                </Link>
            </div>
        </div>
    );
}
