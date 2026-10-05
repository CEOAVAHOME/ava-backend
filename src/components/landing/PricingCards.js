'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/plans';

export default function PricingCards() {
  const router = useRouter();
  const [interval, setInterval] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  async function choose(plan) {
    setLoading(plan);
    setError('');
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Errore durante il checkout');
      if (data.url.startsWith('http')) window.location.href = data.url;
      else router.push(data.url);
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  }

  return (
    <>
      <div className="billing-toggle">
        <div className="tabs" role="tablist">
          <button className={`tab ${interval === 'monthly' ? 'active' : ''}`} onClick={() => setInterval('monthly')}>
            Mensile
          </button>
          <button className={`tab ${interval === 'yearly' ? 'active' : ''}`} onClick={() => setInterval('yearly')}>
            Annuale <span style={{ opacity: 0.8 }}>· -20%</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error center" style={{ maxWidth: 880, margin: '0 auto 20px' }}>{error}</div>}

      <div className="pricing-grid">
        {Object.values(PLANS).map((plan) => (
          <div key={plan.id} className={`card price-card ${plan.highlighted ? 'highlighted' : ''}`}>
            {plan.highlighted && <span className="badge badge-gradient ribbon">Più scelto</span>}
            <h3 style={{ fontSize: '1.3rem' }}>{plan.name}</h3>
            <p className="muted mb-0">{plan.tagline}</p>
            <div className="price">
              €{interval === 'monthly' ? plan.monthly : plan.yearly}
              <small>/mese</small>
            </div>
            <div className="dim" style={{ fontSize: '0.82rem' }}>
              {interval === 'yearly' ? `€${plan.yearly * 12} fatturati annualmente` : 'Fatturazione mensile · IVA esclusa'}
            </div>
            <ul className="feature-list">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className={`btn btn-block ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => choose(plan.id)}
              disabled={loading !== null}
            >
              {loading === plan.id ? <span className="spinner" /> : `Scegli ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      <p className="center dim" style={{ marginTop: 22, fontSize: '0.85rem' }}>
        14 giorni di prova gratuita su entrambi i piani. Pagamenti sicuri con Stripe.
      </p>
    </>
  );
}
