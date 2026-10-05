'use client';

import { useCallback, useEffect, useState } from 'react';
import ReviewList from '@/components/dashboard/ReviewList';
import ReviewModal from '@/components/dashboard/ReviewModal';
import AddReviewModal from '@/components/dashboard/AddReviewModal';

export default function ReviewsPage() {
  const [filters, setFilters] = useState({ status: 'ALL', rating: '', source: 'ALL' });
  const [data, setData] = useState({ reviews: [], business: null });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    if (status) setFilters((f) => ({ ...f, status }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const res = await fetch(`/api/reviews?${qs}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function sync() {
    setSyncing(true);
    setMessage(null);
    const res = await fetch('/api/reviews/sync', { method: 'POST' });
    const body = await res.json();
    setSyncing(false);
    if (!res.ok) return setMessage({ cls: 'alert-error', text: body.error });
    if (body.demo) return setMessage({ cls: 'alert-info', text: 'Modalità demo: configura database e Google OAuth per sincronizzare le recensioni reali.' });
    setMessage({ cls: 'alert-success', text: `Sincronizzazione completata: ${body.imported} nuove, ${body.updated} aggiornate.` });
    load();
  }

  function onSaved(updated) {
    setData((d) => ({ ...d, reviews: d.reviews.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) }));
  }

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row-between wrap">
        <div className="filters" style={{ marginBottom: 0 }}>
          <select className="select" value={filters.status} onChange={set('status')} aria-label="Stato">
            <option value="ALL">Tutti gli stati</option>
            <option value="PENDING">Da rispondere</option>
            <option value="DRAFT">Bozze</option>
            <option value="PUBLISHED">Con risposta</option>
          </select>
          <select className="select" value={filters.rating} onChange={set('rating')} aria-label="Voto">
            <option value="">Tutti i voti</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)}</option>
            ))}
          </select>
          <select className="select" value={filters.source} onChange={set('source')} aria-label="Fonte">
            <option value="ALL">Tutte le fonti</option>
            <option value="GOOGLE">Google</option>
            <option value="TRIPADVISOR">TripAdvisor</option>
            <option value="MANUAL">Manuale</option>
          </select>
        </div>
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>+ Aggiungi recensione</button>
          <button className="btn btn-primary btn-sm" onClick={sync} disabled={syncing}>
            {syncing ? <span className="spinner" /> : '↻ Sincronizza Google'}
          </button>
        </div>
      </div>

      {data.business?.lastSyncedAt && (
        <div className="dim" style={{ fontSize: '0.8rem' }}>
          Ultima sincronizzazione: {new Date(data.business.lastSyncedAt).toLocaleString('it-IT')}
        </div>
      )}
      {message && <div className={`alert ${message.cls}`}>{message.text}</div>}

      <section className="card">
        {loading ? <div className="empty"><span className="spinner" style={{ display: 'inline-block' }} /></div> : <ReviewList reviews={data.reviews} onSelect={setSelected} />}
      </section>

      {selected && (
        <ReviewModal review={selected} defaultTone={data.business?.tone} onClose={() => setSelected(null)} onSaved={onSaved} />
      )}
      {adding && <AddReviewModal onClose={() => setAdding(false)} onAdded={load} />}
    </div>
  );
}
