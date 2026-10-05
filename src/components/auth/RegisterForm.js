'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { CATEGORIES } from '@/lib/plans';
import GoogleButton from './GoogleButton';

export default function RegisterForm({ googleEnabled, plan, interval }) {
  const [form, setForm] = useState({ name: '', businessName: '', category: 'ristorante', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Dopo la registrazione, se l'utente aveva scelto un piano lo mandiamo al checkout.
  const callbackUrl = plan ? `/dashboard/settings?plan=${plan}&interval=${interval || 'monthly'}` : '/dashboard';

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registrazione non riuscita');
      setLoading(false);
      return;
    }
    const login = await signIn('credentials', { email: form.email, password: form.password, redirect: false, callbackUrl });
    window.location.href = login?.error ? '/login?registered=1' : login?.url || callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      {googleEnabled && (
        <>
          <GoogleButton label="Registrati con Google" callbackUrl={callbackUrl} />
          <div className="divider">oppure con email</div>
        </>
      )}
      <div className="field">
        <label htmlFor="name">Il tuo nome</label>
        <input id="name" className="input" required value={form.name} onChange={set('name')} />
      </div>
      <div className="field">
        <label htmlFor="businessName">Nome dell&apos;attività</label>
        <input id="businessName" className="input" required placeholder="es. Trattoria Da Marco" value={form.businessName} onChange={set('businessName')} />
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
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
      </div>
      <div className="field">
        <label htmlFor="password">Password (min. 8 caratteri)</label>
        <input id="password" className="input" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set('password')} />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Crea account gratuito'}
      </button>
      <p className="center muted mb-0" style={{ fontSize: '0.88rem' }}>
        Hai già un account? <Link href="/login" className="gradient-text">Accedi</Link>
      </p>
    </form>
  );
}
