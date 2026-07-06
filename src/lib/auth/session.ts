import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  org: string;
};

export type SessionData = {
  user?: SessionUser;
};

const secret = process.env.SESSION_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    'SESSION_SECRET env var must be set to a random string of at least 32 characters (see .env.example).',
  );
}

export const sessionOptions: SessionOptions = {
  cookieName: 'aegis_session',
  password: secret,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
