import { RatingBars, SentimentDonut, TopicBars, WeeklyTrend } from '@/components/dashboard/SentimentChart';
import StatsCards from '@/components/dashboard/StatsCards';
import { getUserId } from '@/lib/auth';
import { computeStats, getAccount, listReviews } from '@/lib/data';
import { buildInsights } from '@/lib/ai';

export default async function AnalyticsPage() {
  const { business } = await getAccount(await getUserId());
  const reviews = await listReviews(business);
  const stats = computeStats(reviews);
  const insights = buildInsights(reviews);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <StatsCards stats={stats} />

      <div className="grid-2">
        <section className="card">
          <h3>Distribuzione del sentiment</h3>
          <SentimentDonut sentiment={stats.sentiment} total={stats.total} />
        </section>
        <section className="card">
          <h3>Distribuzione dei voti</h3>
          <RatingBars ratings={stats.ratings} total={stats.total} />
        </section>
      </div>

      <section className="card">
        <h3>Voto medio — ultime 8 settimane</h3>
        <WeeklyTrend weeks={stats.weeks} />
      </section>

      <div className="grid-2">
        <section className="card">
          <h3>Temi più citati</h3>
          <p className="dim" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--success)' }}>■</span> menzioni positive ·{' '}
            <span style={{ color: 'var(--danger)' }}>■</span> menzioni negative
          </p>
          <TopicBars topics={stats.topics} />
        </section>
        <section className="card">
          <h3>✦ Suggerimenti operativi</h3>
          {insights.length === 0 ? (
            <p className="muted mb-0">Nessun problema ricorrente nelle recensioni negative. Continua così!</p>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {insights.map((i, idx) => (
                <div key={i.topic} className="insight">
                  <strong>
                    {idx + 1}. <span style={{ textTransform: 'capitalize' }}>{i.topic}</span>
                  </strong>
                  <span className="dim"> · {i.count} recensioni negative</span>
                  <p className="muted mb-0" style={{ fontSize: '0.88rem', marginTop: 4 }}>{i.tip}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
