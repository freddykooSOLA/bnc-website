import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { resolveAndUpsertOAuthMember, type OAuthProvider } from '@/lib/member-oauth';
import { facebookOAuthConfigured } from '@/lib/oauth-providers';

const providers = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
];
if (facebookOAuthConfigured()) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider as OAuthProvider | undefined;
      if (!provider || (provider !== 'google' && provider !== 'facebook')) {
        return false;
      }
      if (!user.email || !account?.providerAccountId) {
        return false;
      }
      await resolveAndUpsertOAuthMember({
        provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        displayName: user.name || user.email,
        image: user.image ?? undefined,
      });
      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider && account.providerAccountId) {
        const provider = account.provider as OAuthProvider;
        const email = user?.email || token.email;
        if (email) {
          const memberId = await resolveAndUpsertOAuthMember({
            provider,
            providerAccountId: account.providerAccountId,
            email,
            displayName: user?.name || email,
            image: user?.image ?? undefined,
          });
          token.sub = memberId;
        }
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