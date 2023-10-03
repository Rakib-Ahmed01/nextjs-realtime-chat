import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from './db';

const getGoogleCredentials = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID as string;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

  if (!clientID || clientID.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_ID');
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET');
  }

  return { clientID, clientSecret };
};

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientID,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const dbuser = (await db.get(`user:${token.id}`)) as User | null;

      console.log({ token, user });

      if (!dbuser) {
        token.id = user?.id;
        return token;
      }

      return {
        id: dbuser.id,
        name: dbuser.name,
        email: dbuser.email,
        picture: dbuser.image,
      };
    },
    session: async ({ session, token }) => {
      console.log({ session, token });
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect: ({ url, baseUrl }) => {
      console.log({ url, baseUrl });
      return '/dashboard';
    },
  },
  session: {
    strategy: 'jwt',
  },
  theme: {
    colorScheme: 'dark',
  },
  pages: {
    signIn: '/login',
  },
};
