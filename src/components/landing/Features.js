const FEATURES = [
  { icon: '💬', title: 'Risposte AI alle recensioni', text: 'Risposte uniche, nel tono della tua attività, che citano i dettagli della recensione. Pubblichi su Google con un click.' },
  { icon: '📱', title: 'Post social pronti', text: 'Instagram, Facebook e Google Business: descrivi l\'argomento, ricevi testo e hashtag con anteprima smartphone.' },
  { icon: '📊', title: 'Analisi del sentiment', text: 'Scopri cosa amano i clienti e cosa li fa arrabbiare: attese, personale, prezzi, pulizia. Con suggerimenti concreti.' },
  { icon: '🔄', title: 'Sincronizzazione automatica', text: 'Collega Google Business Profile e ritrova tutte le recensioni in un\'unica inbox, con lo stato di risposta.' },
  { icon: '🎯', title: 'Tono di voce su misura', text: 'Cordiale, professionale, elegante o informale: l\'AI parla come parleresti tu ai tuoi clienti.' },
  { icon: '🇮🇹', title: 'Fatto per l\'Italia', text: 'Italiano madrelingua, fatturazione con P.IVA, supporto umano in italiano.' },
];

export default function Features() {
  return (
    <section className="section" id="funzionalita">
      <div className="container">
        <div className="section-head">
          <span className="badge">Funzionalità</span>
          <h2 style={{ marginTop: 14 }}>
            La tua reputazione online, <span className="gradient-text">in pilota automatico</span>
          </h2>
          <p>Tre strumenti in uno, per chi ha un&apos;attività da mandare avanti e non ha tempo per i social.</p>
        </div>
        <div className="grid-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card feature">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
