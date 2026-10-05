export function SentimentDonut({ sentiment, total }) {
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const pos = pct(sentiment.POSITIVE);
  const neu = pct(sentiment.NEUTRAL);
  const neg = total ? 100 - pos - neu : 0;

  return (
    <div className="row wrap" style={{ gap: 28 }}>
      <div className="donut" style={{ '--pos': pos, '--neu': neu }}>
        <div className="donut-label">
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{pos}%</div>
          <div className="dim" style={{ fontSize: '0.75rem' }}>positive</div>
        </div>
      </div>
      <div className="stack" style={{ gap: 10, fontSize: '0.9rem' }}>
        <div className="row"><span className="legend-dot" style={{ background: 'var(--success)' }} /> Positive · {sentiment.POSITIVE} ({pos}%)</div>
        <div className="row"><span className="legend-dot" style={{ background: 'var(--warning)' }} /> Neutre · {sentiment.NEUTRAL} ({neu}%)</div>
        <div className="row"><span className="legend-dot" style={{ background: 'var(--danger)' }} /> Negative · {sentiment.NEGATIVE} ({neg}%)</div>
      </div>
    </div>
  );
}

export function RatingBars({ ratings, total }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {[5, 4, 3, 2, 1].map((n) => {
        const count = ratings[n] || 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={n} className="bar-row">
            <span className="stars">{'★'.repeat(n)}</span>
            <div className="bar-track">
              <div className={`bar-fill ${n >= 4 ? 'positive' : n === 3 ? 'neutral' : 'negative'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="muted">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TopicBars({ topics }) {
  if (!topics.length) return <p className="muted mb-0">Ancora nessun tema rilevato.</p>;
  const max = Math.max(...topics.map((t) => t.positive + t.negative));
  return (
    <div className="stack" style={{ gap: 12 }}>
      {topics.map((t) => (
        <div key={t.topic} className="bar-row">
          <span style={{ textTransform: 'capitalize' }}>{t.topic}</span>
          <div className="bar-track" style={{ display: 'flex' }}>
            <div className="bar-fill positive" style={{ width: `${(t.positive / max) * 100}%`, borderRadius: 0 }} />
            <div className="bar-fill negative" style={{ width: `${(t.negative / max) * 100}%`, borderRadius: 0 }} />
          </div>
          <span className="muted">{t.positive + t.negative}</span>
        </div>
      ))}
    </div>
  );
}

export function WeeklyTrend({ weeks }) {
  return (
    <div className="column-chart">
      {weeks.map((w) => (
        <div key={w.label} className="column" title={w.avg ? `Media ${w.avg.toFixed(1)} su ${w.count} recensioni` : 'Nessuna recensione'}>
          <span>{w.avg ? w.avg.toFixed(1) : '–'}</span>
          <div className="col-bar" style={{ height: `${w.avg ? (w.avg / 5) * 100 : 2}%`, opacity: w.avg ? 1 : 0.25 }} />
          <span>{w.label}</span>
        </div>
      ))}
    </div>
  );
}
