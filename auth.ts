import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { upsertMemberFromOAuth } from '@/lib/users';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email) {
        return false;
      }
      const googleId = account.providerAccountId;
      if (!googleId) return false;
      await upsertMemberFromOAuth({
        id: googleId,
        email: user.email,
        displayName: user.name || user.email,
        image: user.image ?? undefined,
      });
      return true;
    },
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
