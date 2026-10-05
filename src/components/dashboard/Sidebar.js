'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

const LINKS = [
  { href: '/dashboard', label: 'Panoramica', icon: '◎' },
  { href: '/dashboard/reviews', label: 'Recensioni', icon: '💬', badge: true },
  { href: '/dashboard/content', label: 'Contenuti social', icon: '📱' },
  { href: '/dashboard/analytics', label: 'Analisi sentiment', icon: '📊' },
  { href: '/dashboard/settings', label: 'Impostazioni', icon: '⚙' },
];

export default function Sidebar({ open, onNavigate, access, pendingCount }) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Logo href="/dashboard" />
      <nav>
        {LINKS.map((l) => {
          const active = l.href === '/dashboard' ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={`side-link ${active ? 'active' : ''}`} onClick={onNavigate}>
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
              {l.badge && pendingCount > 0 && <span className="badge badge-warning count">{pendingCount}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="plan-box">
          <strong>{access.label}</strong>
          <p className="muted" style={{ margin: '4px 0 12px' }}>{access.detail}</p>
          {access.cta && (
            <Link href="/dashboard/settings#abbonamento" className="btn btn-primary btn-sm btn-block" onClick={onNavigate}>
              {access.cta}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
