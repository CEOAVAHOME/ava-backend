import { prisma } from './prisma';
import { appUrl, hasDatabase } from './env';

// Invio tramite Resend (https://resend.com). Senza RESEND_API_KEY le email vengono solo scritte nei log.
const hasResend = Boolean(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'ReviewGenius <onboarding@resend.dev>';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(title, body, cta) {
  return `<!doctype html><html lang="it"><body style="margin:0;background:#f4f4f8;font-family:Inter,Arial,sans-serif;color:#1a1a2e">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#3b82f6,#06b6d4);padding:22px 28px;color:#fff;font-weight:800;font-size:18px">✦ ReviewGenius</td></tr>
<tr><td style="padding:28px">
<h1 style="font-size:20px;margin:0 0 14px">${title}</h1>
${body}
${cta ? `<p style="margin:26px 0 0"><a href="${cta.url}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;display:inline-block">${cta.label}</a></p>` : ''}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #eee;color:#888;font-size:12px">
Ricevi questa email perché hai un account ReviewGenius. <a href="${appUrl}/dashboard/settings" style="color:#888">Gestisci le preferenze</a>
</td></tr></table></td></tr></table></body></html>`;
}

const p = (t) => `<p style="line-height:1.6;margin:0 0 12px">${t}</p>`;

export const templates = {
  welcome: ({ user }) => ({
    subject: 'Benvenuto in ReviewGenius 👋',
    html: layout(
      `Ciao ${esc(user.name?.split(' ')[0] || '')}, benvenuto!`,
      p('La tua prova gratuita di 14 giorni è attiva. In 3 minuti sei operativo:') +
        `<ol style="line-height:1.8;padding-left:20px;margin:0 0 12px">
<li><strong>Collega Google</strong> dalle Impostazioni e scegli la tua sede</li>
<li>Le recensioni arrivano da sole ogni ora, con la <strong>risposta AI già pronta</strong></li>
<li>Se vuoi, attiva la <strong>pubblicazione automatica</strong> delle risposte alle recensioni positive</li>
</ol>`,
      { label: 'Collega Google ora', url: `${appUrl}/dashboard/settings` },
    ),
  }),

  trial_ending: ({ user, daysLeft }) => ({
    subject: `La tua prova termina tra ${daysLeft} giorni`,
    html: layout(
      'La prova gratuita sta per finire',
      p(`Ciao ${esc(user.name?.split(' ')[0] || '')}, mancano <strong>${daysLeft} giorni</strong> alla fine della prova.`) +
        p('Scegli un piano per continuare a ricevere le risposte AI automatiche: i giorni di prova rimasti non si perdono, il primo addebito avviene solo alla scadenza.'),
      { label: 'Scegli il piano', url: `${appUrl}/dashboard/settings#abbonamento` },
    ),
  }),

  trial_ended: ({ user }) => ({
    subject: 'La prova è terminata: le risposte automatiche sono in pausa',
    html: layout(
      'Le automazioni sono in pausa',
      p(`Ciao ${esc(user.name?.split(' ')[0] || '')}, la prova gratuita è terminata e le risposte AI automatiche sono sospese.`) +
        p('Le recensioni continuano ad arrivare: riattiva il servizio per non lasciarle senza risposta.'),
      { label: 'Riattiva ReviewGenius', url: `${appUrl}/dashboard/settings#abbonamento` },
    ),
  }),

  payment_failed: ({ user }) => ({
    subject: 'Pagamento non riuscito: aggiorna la carta',
    html: layout(
      'Non siamo riusciti ad addebitare il rinnovo',
      p(`Ciao ${esc(user.name?.split(' ')[0] || '')}, il pagamento dell'abbonamento non è andato a buon fine.`) +
        p('Riproveremo automaticamente nei prossimi giorni. Per evitare interruzioni, aggiorna il metodo di pagamento.'),
      { label: 'Aggiorna il pagamento', url: `${appUrl}/dashboard/settings#abbonamento` },
    ),
  }),

  weekly_digest: ({ user, business, stats }) => ({
    subject: `${business.name}: ${stats.newCount} nuove recensioni questa settimana`,
    html: layout(
      `La tua settimana in breve`,
      `<table width="100%" style="margin:0 0 16px;text-align:center"><tr>
<td style="padding:12px;background:#f4f0ff;border-radius:10px"><div style="font-size:24px;font-weight:800">${stats.newCount}</div><div style="font-size:12px;color:#666">nuove recensioni</div></td>
<td width="8"></td>
<td style="padding:12px;background:#eef6ff;border-radius:10px"><div style="font-size:24px;font-weight:800">${stats.avg}</div><div style="font-size:12px;color:#666">voto medio</div></td>
<td width="8"></td>
<td style="padding:12px;background:#ecfeff;border-radius:10px"><div style="font-size:24px;font-weight:800">${stats.autoPublished}</div><div style="font-size:12px;color:#666">risposte pubblicate</div></td>
</tr></table>` +
        (stats.pending > 0
          ? p(`Hai <strong>${stats.pending} risposte in bozza</strong> che aspettano solo un clic per essere pubblicate.`)
          : p('Tutte le recensioni hanno una risposta. Ottimo lavoro! 🎉')) +
        (stats.topIssue ? p(`Tema da tenere d'occhio: <strong>${esc(stats.topIssue)}</strong>.`) : ''),
      { label: 'Apri la dashboard', url: `${appUrl}/dashboard` },
    ),
  }),
};

async function deliver(to, { subject, html }) {
  if (!hasResend) {
    console.log(`[email demo] → ${to}: ${subject}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/**
 * Invia l'email `type` una sola volta per (utente, type, key).
 * Restituisce true se è stata inviata ora, false se era già stata inviata.
 */
export async function sendOnce(user, type, key, data = {}) {
  if (!hasDatabase || !user?.email) return false;
  try {
    await prisma.emailLog.create({ data: { userId: user.id, type, key } });
  } catch (err) {
    if (err.code === 'P2002') return false; // già inviata
    throw err;
  }
  try {
    await deliver(user.email, templates[type]({ user, ...data }));
    return true;
  } catch (err) {
    // Annulliamo il log così il prossimo giro del cron ci riprova.
    await prisma.emailLog.deleteMany({ where: { userId: user.id, type, key } });
    console.error('Email failed', type, user.id, err);
    return false;
  }
}
