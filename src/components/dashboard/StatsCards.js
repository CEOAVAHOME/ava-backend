export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Voto medio', value: stats.avg ? stats.avg.toFixed(1).replace('.', ',') : '—', sub: `su ${stats.total} recensioni`, icon: '★' },
    { label: 'Da rispondere', value: stats.pending, sub: stats.pending ? 'Rispondi entro 24h' : 'Tutto in ordine 🎉', icon: '💬', tone: stats.pending ? 'down' : 'up' },
    { label: 'Tasso di risposta', value: `${stats.responseRate}%`, sub: 'Obiettivo: 100%', icon: '↩', tone: stats.responseRate >= 80 ? 'up' : 'down' },
    { label: 'Sentiment positivo', value: stats.total ? `${Math.round((stats.sentiment.POSITIVE / stats.total) * 100)}%` : '—', sub: `${stats.sentiment.NEGATIVE} recensioni negative`, icon: '☺' },
  ];

  return (
    <div className="grid-4">
      {cards.map((c) => (
        <div key={c.label} className="card stat-card">
          <div className="row-between">
            <span className="label">{c.label}</span>
            <span aria-hidden="true">{c.icon}</span>
          </div>
          <div className="value">{c.value}</div>
          <div className={`trend ${c.tone || ''} ${c.tone ? '' : 'dim'}`}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
