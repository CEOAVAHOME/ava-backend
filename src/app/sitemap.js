import { appUrl } from '@/lib/env';

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/risposta-recensioni`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${appUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
