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
                name: 'AdGenius.AI',
                url: 'https://adgenius.ai',
                logo: 'https://adgenius.ai/logo.png',
                description: 'AI-генератор продающих объявлений для Авито, Юла и других площадок',
                email: 'support@adgenius.ai',
                telephone: '+7-999-123-45-67',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Москва',
                    addressCountry: 'RU',
                    streetAddress: 'ул. Примерная, д. 1',
                },
                sameAs: ['https://t.me/adgenius_ai'],
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+7-999-123-45-67',
                    contactType: 'customer service',
                    availableLanguage: 'Russian',
                },
            }}
        />
    );
}

export function WebSiteSchema() {
    return (
        <SchemaOrg
            type="WebSite"
            data={{
                name: 'AdGenius.AI — Генератор объявлений на базе ИИ',
                url: 'https://adgenius.ai',
                description: 'Создавайте продающие объявления для Авито, Юла и OLX с помощью искусственного интеллекта',
                inLanguage: 'ru-RU',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://adgenius.ai/generator?q={search_term_string}',
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
                    name: 'AdGenius.AI',
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
