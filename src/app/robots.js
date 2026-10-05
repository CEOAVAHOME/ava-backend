import { appUrl } from '@/lib/env';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/api'] },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
