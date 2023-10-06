import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import RedisAdapter from './databaseAdapter';
import { db } from './db';
import { parseJSON } from './parseJSON';

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
  adapter: RedisAdapter(db),
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientID,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const dbuser = await db.get(`user:${token.id}`);
      const parsedDBUser = parseJSON(dbuser) as User | null;

      if (!parsedDBUser) {
        token.id = user?.id;
        return token;
      }

      return {
        id: parsedDBUser.id,
        name: parsedDBUser.name,
        email: parsedDBUser.email,
        picture: parsedDBUser.image,
      };
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect: () => {
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
