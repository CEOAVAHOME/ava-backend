import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import FreeReplyTool from '@/components/landing/FreeReplyTool';

export const metadata = {
  title: 'Generatore gratuito di risposte alle recensioni Google con AI',
  description:
    'Incolla una recensione e ottieni in 5 secondi una risposta professionale in italiano. Gratis, senza registrazione. Per ristoranti, hotel, saloni e studi dentistici.',
  alternates: { canonical: '/risposta-recensioni' },
};

const GUIDE = [
  {
    h: 'Come rispondere a una recensione negativa',
    p: 'Ringrazia per nome, scusati per il problema specifico senza giustificarti, spiega cosa hai cambiato e invita il cliente a tornare. Rispondi entro 24-48 ore: chi legge giudica soprattutto come gestisci le critiche.',
  },
  {
    h: 'Come rispondere a una recensione positiva',
    p: 'Evita il solito "Grazie mille!". Cita un dettaglio della recensione (il piatto, il trattamento, il membro dello staff) e chiudi con un invito personale. Le risposte uniche migliorano anche la visibilità su Google Maps.',
  },
  {
    h: 'Perché rispondere a tutte le recensioni',
    p: 'Google considera l\'interazione con le recensioni un segnale di attività della scheda. I clienti scelgono più spesso le attività che rispondono, e una risposta ben scritta trasforma un 2 stelle in una dimostrazione di serietà.',
  },
];

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: GUIDE.map((g) => ({ '@type': 'Question', name: g.h, acceptedAnswer: { '@type': 'Answer', text: g.p } })),
};

export default function FreeToolPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section" style={{ paddingTop: 70 }}>
          <div className="container">
            <div className="section-head">
              <span className="badge badge-gradient">Strumento gratuito</span>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginTop: 14 }}>
                Rispondi alle recensioni <span className="gradient-text">con l&apos;AI, gratis</span>
              </h1>
              <p>Incolla una recensione Google, TripAdvisor o Facebook: ricevi una risposta professionale in italiano in 5 secondi.</p>
            </div>
            <FreeReplyTool />
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 820 }}>
            <h2 className="center" style={{ marginBottom: 28 }}>Guida rapida: come rispondere alle recensioni</h2>
            <div className="stack" style={{ gap: 16 }}>
              {GUIDE.map((g) => (
                <article key={g.h} className="card">
                  <h3>{g.h}</h3>
                  <p className="muted mb-0">{g.p}</p>
                </article>
              ))}
            </div>
            <p className="center" style={{ marginTop: 30 }}>
              <Link href="/register" className="btn btn-primary btn-lg">Rispondi in automatico a tutte le recensioni</Link>
            </p>
          </div>
        </section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      </main>
      <Footer />
    </>
  );
}
