import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ReviewGenius — Rispondi alle recensioni con l\'AI in 5 secondi',
    template: '%s · ReviewGenius',
  },
  description:
    'Il software AI per ristoranti, hotel, saloni e cliniche: risposte automatiche alle recensioni Google e TripAdvisor, post social pronti e analisi del sentiment.',
  keywords: ['recensioni Google', 'risposte recensioni AI', 'reputazione online', 'ristoranti', 'hotel', 'social media'],
  openGraph: {
    title: 'ReviewGenius',
    description: 'Risposte AI alle recensioni, post social e analisi del sentiment per attività locali.',
    locale: 'it_IT',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="bg-orbs" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
