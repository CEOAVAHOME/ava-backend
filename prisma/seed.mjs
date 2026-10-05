// Crea un utente di prova con recensioni di esempio.
// Uso: npm run db:seed  →  login con demo@reviewgenius.it / demo1234
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const REVIEWS = [
  ['Giulia B.', 5, 0, 'POSITIVE', ['cibo', 'personale'], 'Carbonara spettacolare e personale gentilissimo. Torneremo sicuramente!'],
  ['Luca M.', 2, 1, 'NEGATIVE', ['attesa'], 'Cibo buono ma abbiamo aspettato quasi 50 minuti per i primi.'],
  ['Francesca T.', 4, 2, 'POSITIVE', ['ambiente', 'prezzo'], 'Locale accogliente e prezzi onesti.'],
  ['Sara L.', 3, 5, 'NEUTRAL', ['rumore'], 'Piatti nella media, ambiente molto rumoroso.'],
  ['Davide C.', 1, 6, 'NEGATIVE', ['attesa', 'personale'], 'Prenotazione persa, 30 minuti in piedi all\'ingresso.'],
];

async function main() {
  const email = 'demo@reviewgenius.it';
  await prisma.user.deleteMany({ where: { email } });
  await prisma.user.create({
    data: {
      email,
      name: 'Marco Rossi',
      passwordHash: await bcrypt.hash('demo1234', 12),
      businesses: {
        create: {
          name: 'Trattoria Da Marco',
          city: 'Milano',
          reviews: {
            create: REVIEWS.map(([author, rating, ago, sentiment, topics, text], i) => ({
              source: i % 2 ? 'TRIPADVISOR' : 'MANUAL',
              author,
              rating,
              text,
              sentiment,
              topics,
              publishedAt: daysAgo(ago),
            })),
          },
        },
      },
    },
  });
  console.log(`Utente demo creato: ${email} / demo1234`);
}

main().finally(() => prisma.$disconnect());
