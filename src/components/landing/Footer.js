import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row-between wrap">
        <Logo />
        <div className="row wrap" style={{ gap: 22 }}>
          <Link href="/pricing">Prezzi</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/login">Accedi</Link>
          <a href="mailto:info@reviewgenius.it">Contatti</a>
        </div>
        <span>© {new Date().getFullYear()} ReviewGenius</span>
      </div>
    </footer>
  );
}
