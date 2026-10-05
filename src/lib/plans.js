// Condiviso tra client e server: nessun segreto qui.
export const PLANS = {
  BASE: {
    id: 'BASE',
    name: 'Base',
    tagline: 'Per la singola attività che vuole rispondere a tutto',
    monthly: 79,
    yearly: 63,
    features: [
      '1 sede collegata',
      'Risposte AI illimitate alle recensioni',
      'Sincronizzazione Google Business Profile',
      'Pubblicazione risposte su Google con un click',
      '20 post social al mese',
      'Analisi sentiment mensile',
      'Supporto via email',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    tagline: 'Per chi vuole crescere e gestire più sedi',
    monthly: 149,
    yearly: 119,
    highlighted: true,
    features: [
      'Fino a 3 sedi collegate',
      'Risposte AI illimitate alle recensioni',
      'Post social illimitati',
      'Analisi sentiment avanzata + suggerimenti operativi',
      'Supporto prioritario WhatsApp',
    ],
  },
};

export const COMPARISON = [
  ['Sedi collegate', '1', '3'],
  ['Risposte AI alle recensioni', 'Illimitate', 'Illimitate'],
  ['Pubblicazione diretta su Google', '✓', '✓'],
  ['Post social generati', '20 / mese', 'Illimitati'],
  ['Analisi sentiment', 'Mensile', 'In tempo reale'],
  ['Suggerimenti operativi AI', '—', '✓'],
  ['Supporto', 'Email', 'WhatsApp prioritario'],
];

export const TONES = [
  { id: 'cordiale', label: 'Cordiale' },
  { id: 'professionale', label: 'Professionale' },
  { id: 'informale', label: 'Informale' },
  { id: 'elegante', label: 'Elegante' },
];

export const CATEGORIES = [
  { id: 'ristorante', label: 'Ristorante' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'salone', label: 'Salone di bellezza' },
  { id: 'clinica', label: 'Clinica dentale' },
  { id: 'altro', label: 'Altro' },
];
