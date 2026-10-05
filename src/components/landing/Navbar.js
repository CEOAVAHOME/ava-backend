import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container">
        <Logo />
        <nav className="nav-links">
          <Link href="/risposta-recensioni">Strumento gratuito</Link>
          <Link href="/#funzionalita">Funzionalità</Link>
          <Link href="/#testimonianze">Clienti</Link>
          <Link href="/pricing">Prezzi</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="row">
          <Link href="/login" className="btn btn-ghost btn-sm">Accedi</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Prova gratis</Link>
        </div>
      </div>
    </header>
  );
}
