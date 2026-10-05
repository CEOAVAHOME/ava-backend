import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import PricingCards from '@/components/landing/PricingCards';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <section className="section" id="prezzi">
          <div className="container">
            <div className="section-head">
              <span className="badge">Prezzi</span>
              <h2 style={{ marginTop: 14 }}>Meno di un coperto al giorno</h2>
              <p>Due piani semplici. Nessun costo di attivazione.</p>
            </div>
            <PricingCards />
          </div>
        </section>
        <FAQ />
        <section className="section">
          <div className="container">
            <div className="glass cta-band">
              <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)' }}>Pronto a far lavorare l&apos;AI per te?</h2>
              <p className="muted">Collega la tua scheda Google e rispondi alle prime recensioni in meno di 5 minuti.</p>
              <Link href="/register" className="btn btn-primary btn-lg">Inizia gratis</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
