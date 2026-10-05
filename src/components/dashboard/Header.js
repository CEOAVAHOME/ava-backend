'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const TITLES = {
  '/dashboard': 'Panoramica',
  '/dashboard/reviews': 'Recensioni',
  '/dashboard/content': 'Contenuti social',
  '/dashboard/analytics': 'Analisi sentiment',
  '/dashboard/settings': 'Impostazioni',
};

export default function Header({ user, business, onMenu }) {
  const pathname = usePathname();
  const initials = (user?.name || user?.email || '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <header className="dash-header">
      <div className="row">
        <button className="btn btn-ghost btn-sm menu-toggle" onClick={onMenu} aria-label="Apri menu">☰</button>
        <div>
          <h1>{TITLES[pathname] || 'Dashboard'}</h1>
          <div className="dim" style={{ fontSize: '0.8rem' }}>{business?.name}</div>
        </div>
      </div>
      <div className="row">
        <div className="avatar" title={user?.email}>{initials}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => signOut({ callbackUrl: '/' })}>Esci</button>
      </div>
    </header>
  );
}
