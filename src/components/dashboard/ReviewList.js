'use client';

import Stars from '@/components/Stars';

const SOURCE_LABEL = { GOOGLE: 'Google', TRIPADVISOR: 'TripAdvisor', MANUAL: 'Manuale' };
const STATUS = {
  PENDING: { label: 'Da rispondere', cls: 'badge-warning' },
  DRAFT: { label: 'Bozza', cls: '' },
  PUBLISHED: { label: 'Risposta', cls: 'badge-success' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'oggi';
  if (days === 1) return 'ieri';
  if (days < 30) return `${days} giorni fa`;
  return new Date(date).toLocaleDateString('it-IT');
}

export default function ReviewList({ reviews, onSelect, compact = false }) {
  if (!reviews.length) {
    return <div className="empty">Nessuna recensione da mostrare.</div>;
  }

  return (
    <div className="stack">
      {reviews.map((r) => {
        const status = STATUS[r.replyStatus] || STATUS.PENDING;
        return (
          <article key={r.id} className="review-item">
            <div className="row-between wrap">
              <div className="row">
                <div className="avatar">{r.author.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{r.author}</strong>
                  <div className="dim" style={{ fontSize: '0.8rem' }}>
                    {SOURCE_LABEL[r.source] || r.source} · {timeAgo(r.publishedAt)}
                  </div>
                </div>
              </div>
              <div className="row">
                <Stars rating={r.rating} />
                <span className={`badge ${status.cls}`}>{status.label}</span>
              </div>
            </div>
            <p className="text">{compact && r.text.length > 160 ? `${r.text.slice(0, 160)}…` : r.text}</p>
            {!compact && r.reply && <div className="reply-preview">{r.reply}</div>}
            {onSelect && (
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => onSelect(r)}>
                  ✦ {r.reply ? 'Modifica risposta' : 'Rispondi con AI'}
                </button>
                {(r.topics || []).map((t) => (
                  <span key={t} className="badge">#{t}</span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
