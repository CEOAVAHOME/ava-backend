import Link from 'next/link';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentReviews from '@/components/dashboard/RecentReviews';
import { getUserId } from '@/lib/auth';
import { computeStats, getAccount, listReviews } from '@/lib/data';
import { buildInsights } from '@/lib/ai';

const CHECKOUT_MESSAGES = {
  success: { cls: 'alert-success', text: 'Abbonamento attivato, grazie! 🎉 Le funzioni del tuo piano sono già disponibili.' },
  demo: { cls: 'alert-info', text: 'Checkout in modalità demo: configura le chiavi Stripe e i Price ID per accettare pagamenti reali.' },
};

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams;
  const { business } = await getAccount(await getUserId());
  const reviews = await listReviews(business);
  const stats = computeStats(reviews);
  const pending = reviews.filter((r) => r.replyStatus !== 'PUBLISHED').slice(0, 4);
  const insights = buildInsights(reviews);
  const checkout = CHECKOUT_MESSAGES[searchParams?.checkout];

  return (
    <div className="stack" style={{ gap: 24 }}>
      {checkout && <div className={`alert ${checkout.cls}`}>{checkout.text}</div>}

      <StatsCards stats={stats} />

      <div className="grid-main">
        <section className="card">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <h3 className="mb-0">Recensioni in attesa di risposta</h3>
            <Link href="/dashboard/reviews" className="btn btn-ghost btn-sm">Vedi tutte →</Link>
          </div>
          {stats.total === 0 ? (
            <div className="empty">
              Nessuna recensione ancora. <Link href="/dashboard/settings" className="gradient-text">Collega Google</Link> o
              aggiungile manualmente dalla sezione Recensioni.
            </div>
          ) : (
            <RecentReviews reviews={pending} tone={business.tone} />
          )}
        </section>

        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <h3>Azioni rapide</h3>
            <div className="stack" style={{ gap: 10 }}>
              <Link href="/dashboard/reviews?status=PENDING" className="btn btn-primary btn-block">✦ Rispondi alle recensioni</Link>
              <Link href="/dashboard/content" className="btn btn-ghost btn-block">📱 Crea un post social</Link>
              <Link href="/dashboard/analytics" className="btn btn-ghost btn-block">📊 Vedi analisi sentiment</Link>
            </div>
          </section>

          <section className="card">
            <h3>Da migliorare</h3>
            {insights.length === 0 ? (
              <p className="muted mb-0">Nessun problema ricorrente nelle recensioni negative. Ottimo lavoro!</p>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {insights.map((i) => (
                  <div key={i.topic} className="insight">
                    <strong style={{ textTransform: 'capitalize' }}>{i.topic}</strong>
                    <span className="dim"> · citato {i.count} {i.count === 1 ? 'volta' : 'volte'}</span>
                    <p className="muted mb-0" style={{ fontSize: '0.85rem', marginTop: 4 }}>{i.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
