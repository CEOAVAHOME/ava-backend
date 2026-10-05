import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { hasDatabase, hasGoogle } from './env';
import { DEMO_USER } from './mock-data';

export const GOOGLE_BUSINESS_SCOPE = 'https://www.googleapis.com/auth/business.manage';

const providers = [
  CredentialsProvider({
    name: 'Email',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password || '';
      if (!email || !password) return null;

      if (!hasDatabase) {
        // Modalità demo: un solo utente di prova.
        if (email === DEMO_USER.email && password === 'demo1234') {
          return { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email };
        }
        return null;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(password, user.passwordHash);
      return ok ? { id: user.id, name: user.name, email: user.email, image: user.image } : null;
    },
  }),
];

if (hasGoogle) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Necessario per leggere e rispondere alle recensioni via Business Profile API
      authorization: {
        params: {
          scope: `openid email profile ${GOOGLE_BUSINESS_SCOPE}`,
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  );
}

export const authOptions = {
  ...(hasDatabase ? { adapter: PrismaAdapter(prisma) } : {}),
  // JWT è obbligatorio con il provider Credentials
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers,
  callbacks: {
    async signIn({ account }) {
      // L'adapter salva i token solo al primo collegamento: aggiorniamoli a ogni login Google.
      if (hasDatabase && account?.provider === 'google') {
        await prisma.account.updateMany({
          where: { provider: 'google', providerAccountId: account.providerAccountId },
          data: {
            access_token: account.access_token,
            expires_at: account.expires_at,
            scope: account.scope,
            id_token: account.id_token,
            ...(account.refresh_token ? { refresh_token: account.refresh_token } : {}),
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.uid ?? token.sub;
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

/** Restituisce l'id dell'utente loggato oppure `null`. */
export async function getUserId() {
  const session = await getSession();
  return session?.user?.id ?? null;
}
