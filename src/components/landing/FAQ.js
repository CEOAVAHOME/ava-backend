const FAQS = [
  { q: 'Le risposte sembrano scritte da un robot?', a: 'No. L\'AI cita i dettagli specifici di ogni recensione, usa il tono che scegli tu e firma con il nome della tua attività. Puoi sempre modificare il testo prima di pubblicarlo.' },
  { q: 'Come si collega a Google?', a: 'Dalle Impostazioni accedi con l\'account Google che gestisce la tua scheda Business Profile e scegli la sede. ReviewGenius importa le recensioni e può pubblicare le risposte per te.' },
  { q: 'E TripAdvisor?', a: 'TripAdvisor non offre un\'API pubblica per le risposte: incolli la recensione in ReviewGenius, generi la risposta e la copi con un click. La analizziamo comunque nel sentiment.' },
  { q: 'Posso disdire quando voglio?', a: 'Sì. Nessun vincolo: gestisci o annulli l\'abbonamento dal portale clienti in qualsiasi momento.' },
  { q: 'Ricevo fattura?', a: 'Sì, la fattura viene emessa automaticamente a ogni rinnovo con i dati fiscali e la Partita IVA che inserisci al checkout.' },
];

export default function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="badge">FAQ</span>
          <h2 style={{ marginTop: 14 }}>Domande frequenti</h2>
        </div>
        <div className="faq">
          {FAQS.map((f) => (
            <details key={f.q} className="card">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
