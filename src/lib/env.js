// Feature flag basati sulle variabili d'ambiente: ogni integrazione mancante
// fa girare la funzione corrispondente in modalità demo.
export const hasDatabase = Boolean(process.env.DATABASE_URL);
export const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
export const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const TRIAL_DAYS = 14;
