import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/auth/', '/generator', '/payment/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/auth/', '/payment/'],
            },
        ],
        sitemap: 'https://profit-text.ru/sitemap.xml',
        host: 'https://profit-text.ru',
    };
}
