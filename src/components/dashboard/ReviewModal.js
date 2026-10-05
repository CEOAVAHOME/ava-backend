'use client';

import { useEffect, useState } from 'react';
import Stars from '@/components/Stars';
import { TONES } from '@/lib/plans';

export default function ReviewModal({ review, defaultTone = 'cordiale', onClose, onSaved }) {
  const [tone, setTone] = useState(defaultTone);
  const [reply, setReply] = useState(review.reply || '');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function generate() {
    setBusy('generate');
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReply(data.reply);
      if (data.demo) setNotice('Risposta di esempio: aggiungi OPENAI_API_KEY per le risposte AI reali.');
    } catch (err) {
      setError(err.message || 'Generazione non riuscita');
    } finally {
      setBusy(null);
    }
  }

  async function save(publish) {
    setBusy(publish ? 'publish' : 'save');
    setError('');
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply, publish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved?.(data.review);
      onClose();
    } catch (err) {
      setError(err.message || 'Salvataggio non riuscito');
      setBusy(null);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(reply);
    setNotice('Risposta copiata negli appunti.');
  }

  const publishLabel = review.source === 'GOOGLE' ? 'Pubblica su Google' : 'Segna come pubblicata';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal" role="dialog" aria-modal="true" aria-label={`Risposta a ${review.author}`}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <h3 className="mb-0">Rispondi a {review.author}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>

        <div className="review-item" style={{ marginBottom: 18 }}>
          <Stars rating={review.rating} />
          <p className="text mb-0">{review.text}</p>
        </div>

        <div className="row wrap" style={{ marginBottom: 14 }}>
          <div className="tabs">
            {TONES.map((t) => (
              <button key={t.id} className={`tab ${tone === t.id ? 'active' : ''}`} onClick={() => setTone(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={generate} disabled={busy !== null}>
            {busy === 'generate' ? <span className="spinner" /> : reply ? '↻ Rigenera' : '✦ Genera risposta'}
          </button>
        </div>

        <textarea
          className="textarea"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Clicca «Genera risposta» oppure scrivi qui…"
          rows={7}
        />
        <div className="dim" style={{ fontSize: '0.78rem', margin: '6px 0 14px' }}>{reply.length} caratteri</div>

        {notice && <div className="alert alert-info" style={{ marginBottom: 12 }}>{notice}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="row wrap" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={copy} disabled={!reply}>Copia</button>
          <button className="btn btn-ghost btn-sm" onClick={() => save(false)} disabled={!reply || busy !== null}>
            {busy === 'save' ? <span className="spinner" /> : 'Salva bozza'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => save(true)} disabled={!reply || busy !== null}>
            {busy === 'publish' ? <span className="spinner" /> : publishLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
