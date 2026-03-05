import type { Metadata } from 'next';
import AdGenerator from '../../components/AdGenerator';

export const metadata: Metadata = {
    title: 'Создать объявление — AI Генератор описаний для Авито и Юла | AdGenius.AI',
    description:
        'Создайте продающее описание для вашего товара или услуги с помощью нейросети. Выберите категорию, заполните характеристики — получите готовый текст для Авито, Юла, OLX.',
    keywords: [
        'создать объявление',
        'генератор описаний',
        'AI копирайтинг для авито',
        'продающий текст нейросеть',
        'автоматическое описание товара',
    ],
    openGraph: {
        title: 'AI Генератор — Создать объявление',
        description: 'Создайте продающее описание за 2 секунды с помощью ИИ.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function GeneratorPage() {
    return <AdGenerator />;
}
