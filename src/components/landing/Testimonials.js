import Stars from '@/components/Stars';

// SEGNAPOSTO: testimonianze di esempio. Sostituiscile con quelle di clienti reali
// (con il loro consenso) prima del lancio pubblico.

const TESTIMONIALS = [
  { name: 'Chiara Ferri', role: 'Titolare, Osteria del Ponte — Bologna', quote: 'Prima rispondevo a una recensione su dieci. Adesso le copro tutte in dieci minuti la settimana, e il punteggio Google è salito da 4,2 a 4,6.' },
  { name: 'Roberto Gallo', role: 'Direttore, Hotel Belvedere — Como', quote: 'Le risposte sono naturali, in italiano vero. L\'analisi del sentiment ci ha fatto capire che il problema era il check-in, non le camere.' },
  { name: 'Valentina Russo', role: 'Studio Dentistico Russo — Napoli', quote: 'I post per Facebook mi facevano perdere il sabato mattina. Ora li preparo tutti il lunedì in un quarto d\'ora.' },
];

export default function Testimonials() {
  return (
    <section className="section" id="testimonianze">
      <div className="container">
        <div className="section-head">
          <span className="badge">Dicono di noi</span>
          <h2 style={{ marginTop: 14 }}>Attività come la tua, già più serene</h2>
        </div>
        <div className="grid-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card testimonial" style={{ margin: 0 }}>
              <Stars rating={5} />
              <blockquote>“{t.quote}”</blockquote>
              <figcaption className="row">
                <div className="avatar">{t.name.split(' ').map((p) => p[0]).join('')}</div>
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{t.name}</strong>
                  <div className="dim" style={{ fontSize: '0.8rem' }}>{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
