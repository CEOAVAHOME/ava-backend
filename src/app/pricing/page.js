import Navbar from '@/components/landing/Navbar';
import PricingCards from '@/components/landing/PricingCards';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import { COMPARISON } from '@/lib/plans';

export const metadata = { title: 'Prezzi' };

export default async function PricingPage(props) {
  const searchParams = await props.searchParams;
  return (
    <>
      <Navbar />
      <main>
        <section className="section" style={{ paddingTop: 80 }}>
          <div className="container">
            <div className="section-head">
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
                Prezzi <span className="gradient-text">semplici e trasparenti</span>
              </h1>
              <p>Scegli il piano adatto alla tua attività. Cambi o disdici quando vuoi.</p>
            </div>
            {searchParams?.checkout === 'cancelled' && (
              <div className="alert alert-info center" style={{ maxWidth: 880, margin: '0 auto 24px' }}>
                Checkout annullato: nessun addebito è stato effettuato.
              </div>
            )}
            <PricingCards />
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 880 }}>
            <h2 className="center" style={{ marginBottom: 28 }}>Confronto completo</h2>
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Funzionalità</th>
                    <th>Base</th>
                    <th>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(([label, base, pro]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{base}</td>
                      <td>{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
