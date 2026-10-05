'use client';

import { useState } from 'react';

export default function AddReviewModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ author: '', rating: 5, text: '', source: 'TRIPADVISOR' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rating: Number(form.rating) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Errore');
      setLoading(false);
      return;
    }
    onAdded?.();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="glass modal stack" onSubmit={onSubmit} role="dialog" aria-modal="true">
        <div className="row-between">
          <h3 className="mb-0">Aggiungi una recensione</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>
        <p className="muted mb-0" style={{ fontSize: '0.88rem' }}>
          Per TripAdvisor e altre piattaforme senza API: incolla qui la recensione per generare la risposta e includerla nelle analisi.
        </p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="author">Autore</label>
            <input id="author" className="input" required value={form.author} onChange={set('author')} />
          </div>
          <div className="field">
            <label htmlFor="rating">Voto</label>
            <select id="rating" className="select" value={form.rating} onChange={set('rating')}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="source">Fonte</label>
          <select id="source" className="select" value={form.source} onChange={set('source')}>
            <option value="TRIPADVISOR">TripAdvisor</option>
            <option value="MANUAL">Altro</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="text">Testo della recensione</label>
          <textarea id="text" className="textarea" required value={form.text} onChange={set('text')} />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>{loading ? <span className="spinner" /> : 'Aggiungi'}</button>
      </form>
    </div>
  );
}
