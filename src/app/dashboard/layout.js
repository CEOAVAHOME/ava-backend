import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getUserId } from '@/lib/auth';
import { getAccount, hasActiveAccess, listReviews, trialEndsAt } from '@/lib/data';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

function describeAccess(user, demo) {
  if (demo) return { label: 'Modalità demo', detail: 'Dati di esempio. Configura il database per iniziare.', cta: null };
  if (user.plan !== 'FREE' && hasActiveAccess(user)) {
    return { label: `Piano ${PLANS[user.plan]?.name}`, detail: 'Abbonamento attivo', cta: null };
  }
  const end = trialEndsAt(user);
  const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  if (daysLeft > 0) {
    return { label: 'Prova gratuita', detail: `Ancora ${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'}`, cta: 'Scegli un piano' };
  }
  return { label: 'Prova terminata', detail: 'Le funzioni AI sono in pausa.', cta: 'Attiva abbonamento' };
}

export default async function DashboardLayout({ children }) {
  const userId = await getUserId();
  const account = await getAccount(userId);
  if (!account) redirect('/login?callbackUrl=/dashboard');

  const reviews = await listReviews(account.business);
  const pendingCount = reviews.filter((r) => r.replyStatus !== 'PUBLISHED').length;

  return (
    <DashboardShell
      user={{ name: account.user.name, email: account.user.email }}
      business={{ name: account.business.name }}
      access={describeAccess(account.user, account.demo)}
      pendingCount={pendingCount}
    >
      {children}
    </DashboardShell>
  );
}
