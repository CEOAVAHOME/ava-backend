import { notFound, redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import { getSession } from '@/lib/auth';
import { getBusinessMetrics, isAdmin } from '@/lib/metrics';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Incassi', robots: { index: false } };

const eur = (n) => `€${Number(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const date = (d) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

function Stat({ label, value, sub, tone }) {
  return (
    <div className="card stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className={`trend ${tone || 'dim'}`}>{sub}</div>}
    </div>
  );
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login?callbackUrl=/admin');
  if (!isAdmin(session.user?.email)) notFound();

  const m = await getBusinessMetrics();
  const maxMrr = Math.max(...m.monthly.map((x) => x.mrr), 1);
  const healthy = m.syncErrors === 0 && m.pastDue === 0;

  return (
    <main className="container" style={{ padding: '28px 20px 60px' }}>
      <div className="row-between wrap" style={{ marginBottom: 26 }}>
        <Logo href="/admin" />
        <div className="row">
          {m.demo && <span className="badge badge-warning">Dati di esempio</span>}
          <span className={`badge ${healthy ? 'badge-success' : 'badge-warning'}`}>
            {healthy ? '● Tutto in automatico' : '● Serve un\'occhiata'}
          </span>
        </div>
      </div>

      <section className="glass cta-band" style={{ padding: '34px 28px', marginBottom: 22 }}>
        <div className="muted">Incasso mensile ricorrente (MRR)</div>
        <div style={{ fontSize: 'clamp(2.6rem, 8vw, 4.2rem)', fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">
          {eur(m.mrr)}
        </div>
        <div className="muted">
          {m.paying.total} {m.paying.total === 1 ? 'cliente pagante' : 'clienti paganti'} · {eur(m.arr)} all&apos;anno
        </div>
      </section>

      <div className="grid-4" style={{ marginBottom: 22 }}>
        <Stat label="Clienti Base / Pro" value={`${m.paying.BASE} / ${m.paying.PRO}`} sub="abbonamenti attivi" />
        <Stat label="In prova gratuita" value={m.inTrial} sub={`conversione storica ${m.conversion}%`} />
        <Stat label="Nuovi iscritti (30 gg)" value={m.signups30} sub={`${m.freeToolToday} usi strumento gratuito oggi`} tone="up" />
        <Stat label="Disdette (30 gg)" value={m.churned30} sub={m.pastDue ? `${m.pastDue} pagamenti in ritardo` : 'nessun pagamento in ritardo'} tone={m.pastDue ? 'down' : 'up'} />
      </div>

      <div className="grid-main" style={{ marginBottom: 22 }}>
        <section className="card">
          <h3>MRR ultimi 6 mesi <span className="dim" style={{ fontWeight: 400, fontSize: '0.8rem' }}>(stima)</span></h3>
          <div className="column-chart" style={{ height: 200 }}>
            {m.monthly.map((x) => (
              <div key={x.label} className="column">
                <span>{eur(x.mrr)}</span>
                <div className="col-bar" style={{ height: `${Math.max((x.mrr / maxMrr) * 100, 2)}%`, maxWidth: 48 }} />
                <span>{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h3 className="mb-0">Saldo Stripe</h3>
          {!m.stripe ? (
            <p className="muted mb-0">Configura STRIPE_SECRET_KEY per vedere saldo e bonifici.</p>
          ) : m.stripe.error ? (
            <div className="alert alert-error">{m.stripe.error}</div>
          ) : (
            <>
              <div className="row-between"><span className="muted">Disponibile</span><strong>{eur(m.stripe.available)}</strong></div>
              <div className="row-between"><span className="muted">In arrivo</span><strong>{eur(m.stripe.pending)}</strong></div>
              {m.stripe.payouts.length > 0 && (
                <>
                  <div className="dim" style={{ fontSize: '0.8rem', marginTop: 6 }}>Bonifici verso il tuo conto</div>
                  {m.stripe.payouts.map((p) => (
                    <div key={p.id} className="row-between" style={{ fontSize: '0.9rem' }}>
                      <span>{date(p.arrival)} · {p.status === 'paid' ? 'accreditato' : 'in arrivo'}</span>
                      <strong>{eur(p.amount)}</strong>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </section>
      </div>

      <div className="grid-main">
        <section className="card">
          <h3>Ultimi pagamenti ricevuti</h3>
          {!m.stripe?.charges?.length ? (
            <p className="muted mb-0">Nessun pagamento ancora.</p>
          ) : (
            <table className="compare-table">
              <tbody>
                {m.stripe.charges.map((c) => (
                  <tr key={c.id}>
                    <td className="muted">{date(c.created)}</td>
                    <td>{c.email || '—'}</td>
                    <td style={{ textAlign: 'right' }}><strong style={{ color: 'var(--success)' }}>+{eur(c.amount)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card stack">
          <h3 className="mb-0">Stato automazioni</h3>
          <div className="row-between"><span className="muted">Ultima sincronizzazione</span><span>{m.lastSync ? new Date(m.lastSync).toLocaleString('it-IT') : 'mai'}</span></div>
          <div className="row-between"><span className="muted">Attività con errori</span><span className={m.syncErrors ? 'trend down' : 'trend up'}>{m.syncErrors}</span></div>
          <p className="dim mb-0" style={{ fontSize: '0.82rem' }}>
            Recensioni, risposte, email di prova, riepiloghi e solleciti di pagamento girano da soli.
            Se questo riquadro è verde non devi fare nulla.
          </p>
        </section>
      </div>
    </main>
  );
}
