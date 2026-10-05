'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import GoogleButton from './GoogleButton';

export default function LoginForm({ googleEnabled, demo, callbackUrl = '/dashboard', registered }) {
  const [email, setEmail] = useState(demo ? 'demo@reviewgenius.it' : '');
  const [password, setPassword] = useState(demo ? 'demo1234' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
    if (res?.error) {
      setError('Email o password non corretti');
      setLoading(false);
    } else {
      window.location.href = res?.url || callbackUrl;
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      {registered && <div className="alert alert-success">Account creato! Accedi per iniziare la prova gratuita.</div>}
      {demo && (
        <div className="alert alert-info">
          Modalità demo: credenziali già compilate. Collega un database per gli account reali.
        </div>
      )}
      {googleEnabled && (
        <>
          <GoogleButton callbackUrl={callbackUrl} />
          <div className="divider">oppure con email</div>
        </>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? <span className="spinner" /> : 'Accedi'}
      </button>
      <p className="center muted mb-0" style={{ fontSize: '0.88rem' }}>
        Non hai un account? <Link href="/register" className="gradient-text">Prova gratis 14 giorni</Link>
      </p>
    </form>
  );
}
