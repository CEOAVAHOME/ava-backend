import { prisma } from './prisma';

// Client minimale per la Google Business Profile API.
// NB: Google richiede di attivare l'accesso all'API per il progetto Cloud
// (modulo "GBP API access request") prima che questi endpoint rispondano.

const STAR_TO_NUMBER = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export class GoogleNotConnectedError extends Error {
  constructor() {
    super('Account Google non collegato');
    this.name = 'GoogleNotConnectedError';
  }
}

async function refreshAccessToken(account) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Refresh token Google fallito: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
    },
  });
  return updated.access_token;
}

export async function getGoogleAccessToken(userId) {
  const account = await prisma.account.findFirst({ where: { userId, provider: 'google' } });
  if (!account?.access_token) throw new GoogleNotConnectedError();
  const expiresSoon = !account.expires_at || account.expires_at * 1000 < Date.now() + 60_000;
  if (expiresSoon) {
    if (!account.refresh_token) throw new GoogleNotConnectedError();
    return refreshAccessToken(account);
  }
  return account.access_token;
}

async function gfetch(token, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`Google API ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/** Elenca le sedi gestite dall'utente: [{ name: "accounts/1/locations/2", title, address }] */
export async function listLocations(token) {
  const { accounts = [] } = await gfetch(token, 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
  const result = [];
  for (const acc of accounts) {
    let pageToken = '';
    do {
      const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations`);
      url.searchParams.set('readMask', 'name,title,storefrontAddress');
      url.searchParams.set('pageSize', '100');
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      const data = await gfetch(token, url);
      for (const loc of data.locations || []) {
        result.push({
          name: `${acc.name}/${loc.name}`,
          title: loc.title,
          address: loc.storefrontAddress?.locality || '',
        });
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);
  }
  return result;
}

/** Scarica le recensioni di una sede (max `limit`) e le normalizza. */
export async function fetchReviews(token, locationName, limit = 200) {
  const reviews = [];
  let pageToken = '';
  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`);
    url.searchParams.set('pageSize', '50');
    url.searchParams.set('orderBy', 'updateTime desc');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const data = await gfetch(token, url);
    for (const r of data.reviews || []) {
      reviews.push({
        externalId: r.reviewId,
        author: r.reviewer?.displayName || 'Cliente Google',
        rating: STAR_TO_NUMBER[r.starRating] || 0,
        text: r.comment || '',
        publishedAt: new Date(r.createTime),
        reply: r.reviewReply?.comment || null,
        repliedAt: r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime) : null,
      });
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken && reviews.length < limit);
  return reviews;
}

export async function publishReply(token, locationName, reviewId, comment) {
  return gfetch(token, `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${reviewId}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ comment }),
  });
}
