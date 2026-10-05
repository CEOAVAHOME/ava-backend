'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, TONES } from '@/lib/plans';

export default function FreeReplyTool() {
  const [form, setForm] = useState({ businessName: '', category: 'ristorante', author: '', rating: 5, text: '', tone: 'cordiale' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch('/api/free-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ text: data.error, limit: data.limit });
        return;
      }
      setResult(data);
    } catch {
      setError({ text: 'Connessione non riuscita, riprova.' });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result.reply);
    setCopied(true);
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <form className="card stack" onSubmit={onSubmit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="businessName">Nome attività</label>
            <input id="businessName" className="input" placeholder="es. Trattoria Da Marco" value={form.businessName} onChange={set('businessName')} />
          </div>
          <div className="field">
            <label htmlFor="category">Tipo di attività</label>
            <select id="category" className="select" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="author">Nome del cliente</label>
            <input id="author" className="input" placeholder="es. Luca M." value={form.author} onChange={set('author')} />
          </div>
          <div className="field">
            <label htmlFor="rating">Voto</label>
            <select id="rating" className="select" value={form.rating} onChange={set('rating')}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="text">Testo della recensione</label>
          <textarea id="text" className="textarea" required minLength={10} maxLength={1500} placeholder="Incolla qui la recensione ricevuta su Google, TripAdvisor o Facebook…" value={form.text} onChange={set('text')} />
        </div>
        <div className="field">
          <label>Tono</label>
          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {TONES.map((t) => (
              <button type="button" key={t.id} className={`tab ${form.tone === t.id ? 'active' : ''}`} onClick={() => setForm({ ...form, tone: t.id })}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? <span className="spinner" /> : '✦ Genera la risposta gratis'}
        </button>
        <p className="dim center mb-0" style={{ fontSize: '0.8rem' }}>3 risposte gratuite al giorno · nessuna registrazione</p>
      </form>

      <div className="stack">
        {error && (
          <div className="card stack">
            <div className="alert alert-error">{error.text}</div>
            {error.limit && <Link href="/register" className="btn btn-primary">Prova gratis 14 giorni</Link>}
          </div>
        )}
        {result ? (
          <div className="card stack">
            <div className="row-between">
              <span className="badge badge-gradient">✦ La tua risposta</span>
              <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓ Copiata' : 'Copia'}</button>
            </div>
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{result.reply}</p>
            <div className="dim" style={{ fontSize: '0.8rem' }}>Risposte gratuite rimaste oggi: {result.remaining}</div>
          </div>
        ) : (
          !error && (
            <div className="card empty">
              La risposta apparirà qui in pochi secondi.
            </div>
          )
        )}
        <div className="glass cta-band" style={{ padding: 26, textAlign: 'left' }}>
          <h3>Stanco di copiare e incollare?</h3>
          <p className="muted">
            Con ReviewGenius le recensioni Google arrivano da sole, la risposta è già scritta e — se vuoi — viene
            pubblicata in automatico. Tu non devi fare niente.
          </p>
          <Link href="/register" className="btn btn-primary">Automatizza tutto · 14 giorni gratis</Link>
        </div>
      </div>
    </div>
  );
}
