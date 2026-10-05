import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import RegisterForm from '@/components/auth/RegisterForm';
import { getSession } from '@/lib/auth';
import { hasDatabase, hasGoogle } from '@/lib/env';

export const metadata = { title: 'Prova gratis' };

export default async function RegisterPage(props) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (session) redirect('/dashboard');
  if (!hasDatabase) redirect('/login');

  const plan = ['BASE', 'PRO'].includes(searchParams?.plan) ? searchParams.plan : null;
  const interval = searchParams?.interval === 'yearly' ? 'yearly' : 'monthly';

  return (
    <main className="auth-page">
      <div className="glass auth-card fade-up">
        <Logo />
        <h1 className="center" style={{ fontSize: '1.5rem' }}>Inizia la prova gratuita</h1>
        <p className="center muted">14 giorni completi, nessuna carta richiesta</p>
        <RegisterForm googleEnabled={hasGoogle} plan={plan} interval={interval} />
      </div>
    </main>
  );
}
