'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardShell({ user, business, access, pendingCount, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dash">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} access={access} pendingCount={pendingCount} />
      <div className="dash-main">
        <Header user={user} business={business} onMenu={() => setMenuOpen((o) => !o)} />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
