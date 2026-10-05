import { chat } from './openai';

const CATEGORY_LABEL = {
  ristorante: 'ristorante',
  hotel: 'hotel',
  salone: 'salone di bellezza',
  clinica: 'clinica dentale',
  altro: 'attività locale',
};

function describeBusiness(business) {
  const kind = CATEGORY_LABEL[business?.category] || 'attività locale';
  const city = business?.city ? ` a ${business.city}` : '';
  return `${business?.name || 'la nostra attività'}, ${kind}${city}`;
}

// ---------- Risposte alle recensioni ----------

export async function generateReviewReply({ review, business, tone = business?.tone || 'cordiale' }) {
  const firstName = (review.author || '').split(' ')[0] || 'cliente';

  const ai = await chat({
    system:
      `Sei il titolare di ${describeBusiness(business)} e rispondi alle recensioni online in italiano. ` +
      `Tono: ${tone}. Regole: massimo 80 parole; ringrazia per nome; cita un dettaglio specifico della recensione; ` +
      `se ci sono critiche scusati senza essere servile, spiega cosa farai concretamente e invita a tornare; ` +
      `non inventare promozioni, sconti o fatti; niente hashtag; firma con "Lo staff di ${business?.name || 'noi'}".`,
    user: `Recensione di ${review.author} (${review.rating}/5):\n"${review.text}"`,
    temperature: 0.7,
    maxTokens: 300,
  });
  if (ai) return { reply: ai, demo: false };

  const sign = `Lo staff di ${business?.name || 'ReviewGenius'}`;
  let reply;
  if (review.rating >= 4) {
    reply = `Ciao ${firstName}, grazie di cuore per le tue parole! Siamo felici che la tua esperienza ti sia piaciuta e non vediamo l'ora di riaccoglierti presto. ${sign}`;
  } else if (review.rating === 3) {
    reply = `Ciao ${firstName}, grazie per il tuo riscontro sincero. Prendiamo nota dei tuoi suggerimenti per migliorare e speriamo di poterti offrire un'esperienza da 5 stelle alla prossima visita. ${sign}`;
  } else {
    reply = `Gentile ${firstName}, ci dispiace molto per quanto accaduto: non è lo standard che vogliamo offrire. Abbiamo già condiviso la tua segnalazione con il team per evitare che si ripeta. Ci piacerebbe avere l'occasione di rimediare: scrivici quando vuoi. ${sign}`;
  }
  return { reply, demo: true };
}

// ---------- Post social ----------

const PLATFORM_HINT = {
  instagram: 'Instagram: tono emozionale, emoji con moderazione, 5-8 hashtag pertinenti, call to action finale.',
  facebook: 'Facebook: tono colloquiale, 2-3 paragrafi brevi, 2-3 hashtag, invito a commentare o prenotare.',
  google: 'Google Business Profile: tono informativo, massimo 1500 caratteri, nessun hashtag, call to action chiara.',
};

export async function generateSocialPost({ business, platform = 'instagram', topic, tone = business?.tone || 'cordiale' }) {
  const ai = await chat({
    system:
      `Sei il social media manager di ${describeBusiness(business)}. Scrivi in italiano. Tono: ${tone}. ` +
      `${PLATFORM_HINT[platform] || PLATFORM_HINT.instagram} ` +
      'Rispondi SOLO con JSON: {"content": string, "hashtags": string[]} (hashtag senza #, nel testo non ripeterli).',
    user: `Argomento del post: ${topic}`,
    json: true,
    temperature: 0.9,
    maxTokens: 700,
  });
  if (ai?.content) {
    return { content: ai.content, hashtags: Array.isArray(ai.hashtags) ? ai.hashtags : [], demo: false };
  }

  const name = business?.name || 'noi';
  const content =
    platform === 'google'
      ? `${topic}! Ti aspettiamo da ${name}${business?.city ? ` a ${business.city}` : ''}. Prenota ora il tuo posto e scopri perché i nostri clienti tornano sempre.`
      : `✨ ${topic} ✨\n\nDa ${name} ogni dettaglio è pensato per farti sentire a casa. Vieni a trovarci e raccontaci la tua esperienza!\n\n📍 Prenota ora — link in bio`;
  const hashtags = platform === 'google' ? [] : ['localbusiness', 'madeinitaly', (business?.city || 'italia').toLowerCase(), 'esperienza', 'novità'];
  return { content, hashtags, demo: true };
}

// ---------- Sentiment ----------

const TOPIC_KEYWORDS = {
  attesa: ['attes', 'aspett', 'lent', 'ritardo', 'minuti'],
  personale: ['personale', 'staff', 'cameriere', 'gentil', 'scortes', 'servizio'],
  cibo: ['cibo', 'piatt', 'pizza', 'pasta', 'carbonara', 'amatriciana', 'dolce', 'menù', 'menu', 'gusto'],
  prezzo: ['prezz', 'caro', 'costoso', 'conto', 'qualità/prezzo', '€'],
  pulizia: ['pulit', 'sporc', 'igiene', 'bagno'],
  ambiente: ['ambiente', 'locale', 'atmosfera', 'arredament', 'accoglient'],
  rumore: ['rumor', 'confusione', 'casino'],
};

function heuristicSentiment(review) {
  const text = (review.text || '').toLowerCase();
  const topics = Object.entries(TOPIC_KEYWORDS)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([topic]) => topic);
  const sentiment = review.rating >= 4 ? 'POSITIVE' : review.rating === 3 ? 'NEUTRAL' : 'NEGATIVE';
  return { sentiment, topics };
}

export async function analyzeReviewSentiment(review) {
  const ai = await chat({
    system:
      'Classifica la recensione. Rispondi SOLO con JSON: {"sentiment": "POSITIVE"|"NEUTRAL"|"NEGATIVE", "topics": string[]}. ' +
      `I topics vanno scelti tra: ${Object.keys(TOPIC_KEYWORDS).join(', ')}.`,
    user: `(${review.rating}/5) ${review.text}`,
    json: true,
    temperature: 0,
    maxTokens: 100,
  });
  if (ai && ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(ai.sentiment)) {
    return { sentiment: ai.sentiment, topics: (ai.topics || []).filter((t) => t in TOPIC_KEYWORDS) };
  }
  return heuristicSentiment(review);
}

// ---------- Suggerimenti operativi ----------

const TOPIC_TIPS = {
  attesa: 'Rinforza il personale nei turni di punta (venerdì/sabato sera) e comunica i tempi di attesa al momento dell\'ordine.',
  personale: 'Organizza un breve briefing pre-servizio su accoglienza e gestione dei reclami.',
  cibo: 'Raccogli feedback diretto dallo chef sui piatti citati più spesso.',
  prezzo: 'Valuta un menù fisso o una formula pranzo per migliorare la percezione del rapporto qualità/prezzo.',
  pulizia: 'Introduci una checklist di pulizia oraria per sala e servizi igienici.',
  ambiente: 'Cura illuminazione e musica: sono i dettagli più citati quando si parla di atmosfera.',
  rumore: 'Pannelli fonoassorbenti o tavoli più distanziati riducono le lamentele sul rumore.',
};

export function buildInsights(reviews) {
  const negativeTopics = {};
  for (const r of reviews) {
    if (r.sentiment !== 'NEGATIVE' && r.rating > 3) continue;
    for (const t of r.topics || []) negativeTopics[t] = (negativeTopics[t] || 0) + 1;
  }
  return Object.entries(negativeTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic, count]) => ({ topic, count, tip: TOPIC_TIPS[topic] }));
}
