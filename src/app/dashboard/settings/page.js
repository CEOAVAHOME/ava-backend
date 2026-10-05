'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { CATEGORIES, PLANS, TONES } from '@/lib/plans';

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Errore');
  return data;
}

export default function SettingsPage() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [locations, setLocations] = useState(null);
  const [billingBusy, setBillingBusy] = useState(null);
  const autoCheckout = useRef(false);

  useEffect(() => {
    fetch('/api/business')
      .then((r) => r.json())
      .then((d) => {
        setInfo(d);
        setForm({
          name: d.business.name,
          city: d.business.city || '',
          category: d.business.category,
          tone: d.business.tone,
          googleLocationName: d.business.googleLocationName || '',
        });
      });
  }, []);

  useEffect(() => {
    if (!info?.googleConnected) return;
    fetch('/api/google/locations')
      .then((r) => r.json())
      .then((d) => setLocations(d.locations || []));
  }, [info?.googleConnected]);

  // Arrivati dalla registrazione con un piano scelto: apriamo subito il checkout.
  useEffect(() => {
    if (!info || autoCheckout.current) return;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan && PLANS[plan] && info.user.plan === 'FREE') {
      autoCheckout.current = true;
      checkout(plan, params.get('interval') === 'yearly' ? 'yearly' : 'monthly');
    }
  }, [info]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInfo((i) => ({ ...i, business: data.business }));
      setMessage({ cls: 'alert-success', text: data.demo ? 'Salvato (solo per questa sessione: modalità demo).' : 'Impostazioni salvate.' });
    } catch (err) {
      setMessage({ cls: 'alert-error', text: err.message || 'Salvataggio non riuscito' });
    } finally {
      setSaving(false);
    }
  }

  async function checkout(plan, interval = 'monthly') {
    setBillingBusy(plan);
    try {
      const { url } = await postJson('/api/stripe', { plan, interval });
      window.location.href = url;
    } catch (err) {
      setMessage({ cls: 'alert-error', text: err.message });
      setBillingBusy(null);
    }
  }

  async function openPortal() {
    setBillingBusy('portal');
    try {
      const { url } = await postJson('/api/stripe/portal');
      window.location.href = url;
    } catch (err) {
      setMessage({ cls: 'alert-error', text: err.message });
      setBillingBusy(null);
    }
  }

  if (!form) {
    return <div className="empty"><span className="spinner" style={{ display: 'inline-block' }} /></div>;
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const { user } = info;
  const paid = user.plan && user.plan !== 'FREE';

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 860 }}>
      {message && <div className={`alert ${message.cls}`}>{message.text}</div>}

      <form className="card stack" onSubmit={save}>
        <h3 className="mb-0">La tua attività</h3>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="city">Città</label>
            <input id="city" className="input" value={form.city} onChange={set('city')} />
          </div>
          <div className="field">
            <label htmlFor="category">Categoria</label>
            <select id="category" className="select" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tone">Tono di voce predefinito</label>
            <select id="tone" className="select" value={form.tone} onChange={set('tone')}>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="mb-0" style={{ marginTop: 10 }}>Google Business Profile</h3>
        {info.demo ? (
          <div className="alert alert-info">Configura database e Google OAuth per collegare la tua scheda Google.</div>
        ) : !info.googleConnected ? (
          <div className="row-between wrap review-item">
            <span className="muted">Collega l&apos;account Google che gestisce la tua scheda per importare le recensioni e rispondere direttamente.</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => signIn('google', { callbackUrl: '/dashboard/settings' })}>
              Collega Google
            </button>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="location">Sede da sincronizzare</label>
            {locations === null ? (
              <span className="dim">Caricamento sedi…</span>
            ) : locations.length === 0 ? (
              <div className="alert alert-info">
                Nessuna sede trovata per questo account Google. Verifica di essere proprietario o gestore della scheda e che il progetto Google Cloud abbia accesso alla Business Profile API.
              </div>
            ) : (
              <select id="location" className="select" value={form.googleLocationName} onChange={set('googleLocationName')}>
                <option value="">— Seleziona —</option>
                {locations.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.title}{l.address ? ` · ${l.address}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <button className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Salva impostazioni'}</button>
        </div>
      </form>

      <section className="card stack" id="abbonamento">
        <h3 className="mb-0">Abbonamento</h3>
        {paid ? (
          <div className="row-between wrap">
            <div>
              <strong>Piano {PLANS[user.plan]?.name}</strong>{' '}
              <span className="badge badge-success">{user.subscriptionStatus || 'attivo'}</span>
              {user.currentPeriodEnd && (
                <div className="dim" style={{ fontSize: '0.85rem' }}>
                  Prossimo rinnovo: {new Date(user.currentPeriodEnd).toLocaleDateString('it-IT')}
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={openPortal} disabled={billingBusy !== null}>
              {billingBusy === 'portal' ? <span className="spinner" /> : 'Gestisci abbonamento e fatture'}
            </button>
          </div>
        ) : (
          <>
            <p className="muted mb-0">
              {info.trialEndsAt && new Date(info.trialEndsAt) > new Date()
                ? `Prova gratuita attiva fino al ${new Date(info.trialEndsAt).toLocaleDateString('it-IT')}.`
                : info.demo
                  ? 'Modalità demo.'
                  : 'Il periodo di prova è terminato.'}{' '}
              Scegli un piano per continuare a usare le funzioni AI.
            </p>
            <div className="grid-2">
              {Object.values(PLANS).map((p) => (
                <div key={p.id} className={`review-item ${p.highlighted ? 'price-card highlighted' : ''}`} style={{ padding: 18 }}>
                  <div className="row-between">
                    <strong>{p.name}</strong>
                    <span>€{p.monthly}/mese</span>
                  </div>
                  <p className="dim" style={{ fontSize: '0.83rem' }}>{p.tagline}</p>
                  <div className="row">
                    <button className="btn btn-primary btn-sm" onClick={() => checkout(p.id, 'monthly')} disabled={billingBusy !== null}>
                      {billingBusy === p.id ? <span className="spinner" /> : 'Mensile'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => checkout(p.id, 'yearly')} disabled={billingBusy !== null}>
                      Annuale €{p.yearly}/mese
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
