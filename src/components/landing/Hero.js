import Link from 'next/link';
import Stars from '@/components/Stars';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <span className="badge badge-gradient fade-up">✦ Nuovo: sincronizzazione con Google Business Profile</span>
        <h1 className="fade-up">
          Rispondi a ogni recensione <span className="gradient-text">in 5 secondi</span> con l&apos;AI
        </h1>
        <p className="lead fade-up">
          ReviewGenius scrive risposte personalizzate alle recensioni, crea i post social della settimana e ti
          dice cosa migliorare. Pensato per ristoranti, hotel, saloni e cliniche.
        </p>
        <div className="hero-cta fade-up">
          <Link href="/register" className="btn btn-primary btn-lg">Inizia la prova gratuita di 14 giorni</Link>
          <Link href="/login" className="btn btn-ghost btn-lg">Guarda la demo</Link>
        </div>
        <p className="hero-proof">Nessuna carta richiesta · Disdici quando vuoi · Configurazione in 3 minuti</p>

        <div className="glass hero-demo fade-up">
          <div className="demo-review">
            <div className="row-between">
              <div className="row">
                <div className="avatar">LM</div>
                <div>
                  <strong>Luca M.</strong>
                  <div className="dim" style={{ fontSize: '0.8rem' }}>Google · 2 ore fa</div>
                </div>
              </div>
              <Stars rating={2} />
            </div>
            <p className="text mb-0" style={{ marginTop: 12 }}>
              Cibo buono ma abbiamo aspettato quasi 50 minuti per i primi. Il sabato sera serve più personale.
            </p>
          </div>
          <div className="demo-reply">
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="badge badge-gradient">✦ Risposta AI</span>
              <span className="dim" style={{ fontSize: '0.8rem' }}>generata in 4,2 s</span>
            </div>
            <p className="mb-0">
              Gentile Luca, grazie per averci segnalato l&apos;attesa: 50 minuti sono troppi, ci scusiamo. Da questo
              weekend abbiamo aggiunto un cameriere in sala il sabato sera. Saremmo felici di riaverti ospite per
              farti vivere un servizio all&apos;altezza dei nostri piatti. — Lo staff della Trattoria Da Marco
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
