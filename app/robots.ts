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
        sitemap: 'https://adgenius.ai/sitemap.xml',
        host: 'https://adgenius.ai',
    };
}
