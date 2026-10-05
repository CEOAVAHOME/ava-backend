'use client';

import { useEffect, useState } from 'react';
import { TONES } from '@/lib/plans';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '👍' },
  { id: 'google', label: 'Google Business', icon: '📍' },
];

const IDEAS = [
  'Nuovo menù autunnale con funghi porcini e tartufo',
  'Serata degustazione vini del venerdì',
  'Ringraziamento ai clienti per le 500 recensioni',
  'Dietro le quinte: la nostra pasta fatta a mano',
];

export default function ContentGenerator({ business }) {
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState(business?.tone || 'cordiale');
  const [topic, setTopic] = useState('');
  const [post, setPost] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/generate-content')
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setHistory(d.posts || []));
  }, []);

  async function generate(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const created = { ...data, platform, topic, createdAt: new Date().toISOString() };
      setPost(created);
      if (data.id) setHistory((h) => [created, ...h].slice(0, 20));
    } catch (err) {
      setError(err.message || 'Generazione non riuscita');
    } finally {
      setLoading(false);
    }
  }

  const fullText = post ? `${post.content}${post.hashtags?.length ? `\n\n${post.hashtags.map((h) => `#${h}`).join(' ')}` : ''}` : '';

  async function copy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
  }

  return (
    <div className="grid-main">
      <div className="stack" style={{ gap: 20 }}>
        <form className="card stack" onSubmit={generate}>
          <h3 className="mb-0">Crea un nuovo post</h3>
          <div className="field">
            <label>Piattaforma</label>
            <div className="tabs" style={{ flexWrap: 'wrap' }}>
              {PLATFORMS.map((p) => (
                <button type="button" key={p.id} className={`tab ${platform === p.id ? 'active' : ''}`} onClick={() => setPlatform(p.id)}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="topic">Di cosa vuoi parlare?</label>
            <textarea id="topic" className="textarea" style={{ minHeight: 90 }} required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="es. Da questa settimana pranzo di lavoro a 14€" />
            <div className="row wrap" style={{ gap: 6 }}>
              {IDEAS.map((i) => (
                <button type="button" key={i} className="badge" style={{ cursor: 'pointer' }} onClick={() => setTopic(i)}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="tone">Tono</label>
            <select id="tone" className="select" value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" disabled={loading || !topic.trim()}>
            {loading ? <span className="spinner" /> : '✦ Genera post'}
          </button>
        </form>

        {post && (
          <section className="card stack">
            <div className="row-between">
              <h3 className="mb-0">Testo generato</h3>
              <div className="row">
                <button className="btn btn-ghost btn-sm" onClick={generate} disabled={loading}>↻ Rigenera</button>
                <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? '✓ Copiato' : 'Copia'}</button>
              </div>
            </div>
            {post.demo && <div className="alert alert-info">Testo di esempio: aggiungi OPENAI_API_KEY per i contenuti AI reali.</div>}
            <textarea className="textarea" value={fullText} readOnly rows={8} />
          </section>
        )}

        {history.length > 0 && (
          <section className="card">
            <h3>Post recenti</h3>
            <div className="stack" style={{ gap: 10 }}>
              {history.map((h, i) => (
                <button key={h.id || i} className="review-item" style={{ textAlign: 'left', color: 'inherit', font: 'inherit', cursor: 'pointer' }} onClick={() => setPost(h)}>
                  <div className="row-between">
                    <strong style={{ fontSize: '0.9rem' }}>{h.topic}</strong>
                    <span className="badge">{PLATFORMS.find((p) => p.id === h.platform)?.label}</span>
                  </div>
                  <div className="dim" style={{ fontSize: '0.78rem' }}>{new Date(h.createdAt).toLocaleString('it-IT')}</div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="phone" aria-label="Anteprima smartphone">
        <div className="phone-screen">
          <div className="phone-header">
            <div className="avatar">{(business?.name || 'RG').slice(0, 2).toUpperCase()}</div>
            <span>{business?.name}</span>
          </div>
          <div className="phone-image">{PLATFORMS.find((p) => p.id === platform)?.icon}</div>
          <div className="phone-caption">
            {post ? (
              <>
                {post.content}
                {post.hashtags?.length > 0 && <div className="tags">{post.hashtags.map((h) => `#${h}`).join(' ')}</div>}
              </>
            ) : (
              <span className="dim">L&apos;anteprima del post apparirà qui.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
