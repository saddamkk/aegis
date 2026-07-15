import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type AdminRole = 'master_admin' | 'admin';

export type SessionAdmin = {
  id: string;
  email: string;
  role: AdminRole;
};

export type AdminSessionData = {
  admin?: SessionAdmin;
};

// Deliberately a separate cookie + secret from the public user session
// (src/lib/auth/session.ts) -- the admin system is fully independent, so a
// bug in one session mechanism can't grant access via the other.
function getAdminSessionOptions(): SessionOptions {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET env var must be set to a random string of at least 32 characters (see .env.example).',
    );
  }

  return {
    cookieName: 'aegis_admin_session',
    password: secret,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
}
