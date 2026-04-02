import React from 'react';

interface SchemaOrgProps {
    type: 'Organization' | 'WebSite' | 'WebPage' | 'Product' | 'FAQPage' | 'Service';
    data: Record<string, unknown>;
}

export default function SchemaOrg({ type, data }: SchemaOrgProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function OrganizationSchema() {
    return (
        <SchemaOrg
            type="Organization"
            data={{
                name: 'ProfitText.AI',
                url: 'https://profit-text.ru',
                logo: 'https://profit-text.ru/logo.png',
                description: 'AI-генератор продающих объявлений для Авито, Юла и других площадок',
                email: 'support@profit-text.ru',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Москва',
                    addressCountry: 'RU',
                    streetAddress: 'ул. Примерная, д. 1',
                },
                sameAs: ['https://t.me/profittext_ai'],
            }}
        />
    );
}

export function WebSiteSchema() {
    return (
        <SchemaOrg
            type="WebSite"
            data={{
                name: 'ProfitText.AI — Генератор объявлений на базе ИИ',
                url: 'https://profit-text.ru',
                description: 'Создавайте продающие объявления для Авито, Юла и Drom с помощью искусственного интеллекта',
                inLanguage: 'ru-RU',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://profit-text.ru/generator?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                },
            }}
        />
    );
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
    return (
        <SchemaOrg
            type="FAQPage"
            data={{
                mainEntity: questions.map((q) => ({
                    '@type': 'Question',
                    name: q.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: q.answer,
                    },
                })),
            }}
        />
    );
}

export function ServiceSchema({ name, description, price }: { name: string; description: string; price: string }) {
    return (
        <SchemaOrg
            type="Service"
            data={{
                name,
                description,
                provider: {
                    '@type': 'Organization',
                    name: 'ProfitText.AI',
                },
                offers: {
                    '@type': 'Offer',
                    price,
                    priceCurrency: 'RUB',
                    availability: 'https://schema.org/InStock',
                },
                areaServed: {
                    '@type': 'Country',
                    name: 'Россия',
                },
            }}
        />
    );
}
