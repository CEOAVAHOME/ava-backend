// Dati demo in italiano, usati quando il database non è configurato.
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_USER = {
  id: 'demo-user',
  name: 'Marco Rossi',
  email: 'demo@reviewgenius.it',
  plan: 'PRO',
  weeklyDigest: true,
};

export const DEMO_BUSINESS = {
  id: 'demo-business',
  name: 'Trattoria Da Marco',
  category: 'ristorante',
  city: 'Milano',
  tone: 'cordiale',
  googleLocationName: null,
  lastSyncedAt: null,
  autoDraftReplies: true,
  autoPublishReplies: false,
  autoPublishMinRating: 4,
};

export const DEMO_REVIEWS = [
  { id: 'r1', source: 'GOOGLE', author: 'Giulia B.', rating: 5, publishedAt: daysAgo(0), sentiment: 'POSITIVE', topics: ['cibo', 'personale'], text: 'Carbonara spettacolare e personale gentilissimo. Torneremo sicuramente con tutta la famiglia!', reply: null, replyStatus: 'PENDING' },
  { id: 'r2', source: 'TRIPADVISOR', author: 'Luca M.', rating: 2, publishedAt: daysAgo(1), sentiment: 'NEGATIVE', topics: ['attesa'], text: 'Cibo buono ma abbiamo aspettato quasi 50 minuti per i primi. Il sabato sera serve più personale in sala.', reply: null, replyStatus: 'PENDING' },
  { id: 'r3', source: 'GOOGLE', author: 'Francesca T.', rating: 4, publishedAt: daysAgo(2), sentiment: 'POSITIVE', topics: ['ambiente', 'prezzo'], text: 'Locale accogliente e prezzi onesti. Il tiramisù era un po\' troppo dolce per i miei gusti.', reply: 'Grazie Francesca! Riferiremo allo chef il tuo consiglio sul tiramisù. A presto!', replyStatus: 'PUBLISHED' },
  { id: 'r4', source: 'GOOGLE', author: 'Alessandro P.', rating: 5, publishedAt: daysAgo(3), sentiment: 'POSITIVE', topics: ['cibo'], text: 'La migliore amatriciana di Milano. Porzioni abbondanti e vino della casa ottimo.', reply: null, replyStatus: 'PENDING' },
  { id: 'r5', source: 'TRIPADVISOR', author: 'Sara L.', rating: 3, publishedAt: daysAgo(5), sentiment: 'NEUTRAL', topics: ['rumore', 'cibo'], text: 'Piatti nella media, ambiente molto rumoroso. Difficile conversare.', reply: null, replyStatus: 'PENDING' },
  { id: 'r6', source: 'GOOGLE', author: 'Davide C.', rating: 1, publishedAt: daysAgo(6), sentiment: 'NEGATIVE', topics: ['attesa', 'personale'], text: 'Prenotazione persa, 30 minuti in piedi all\'ingresso e nessuna scusa. Peccato.', reply: 'Gentile Davide, ci scusiamo sinceramente per il disguido...', replyStatus: 'DRAFT' },
  { id: 'r7', source: 'GOOGLE', author: 'Elena V.', rating: 5, publishedAt: daysAgo(8), sentiment: 'POSITIVE', topics: ['personale', 'ambiente'], text: 'Festeggiato il compleanno qui: staff fantastico, ci hanno anche portato una torta a sorpresa!', reply: 'Grazie Elena, è stato un piacere festeggiare con voi!', replyStatus: 'PUBLISHED' },
  { id: 'r8', source: 'TRIPADVISOR', author: 'Paolo G.', rating: 4, publishedAt: daysAgo(10), sentiment: 'POSITIVE', topics: ['cibo', 'prezzo'], text: 'Ottimo rapporto qualità/prezzo, menù pranzo a 14€ consigliatissimo.', reply: null, replyStatus: 'PENDING' },
];

export const DEMO_POSTS = [];
