import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import LoginForm from '@/components/auth/LoginForm';
import { getSession } from '@/lib/auth';
import { hasDatabase, hasGoogle } from '@/lib/env';

export const metadata = { title: 'Accedi' };

export default async function LoginPage(props) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (session) redirect('/dashboard');

  // Accettiamo solo percorsi interni come destinazione dopo il login.
  const callbackUrl = searchParams?.callbackUrl?.startsWith('/') ? searchParams.callbackUrl : '/dashboard';

  return (
    <main className="auth-page">
      <div className="glass auth-card fade-up">
        <Logo />
        <h1 className="center" style={{ fontSize: '1.5rem' }}>Bentornato</h1>
        <p className="center muted">Accedi alla tua dashboard ReviewGenius</p>
        <LoginForm
          googleEnabled={hasGoogle && hasDatabase}
          demo={!hasDatabase}
          callbackUrl={callbackUrl}
          registered={searchParams?.registered === '1'}
        />
      </div>
    </main>
  );
}
