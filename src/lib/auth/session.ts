import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  org: string;
};

export type SessionData = {
  user?: SessionUser;
};

// Validated lazily (on first request), not at module load — throwing at
// import time crashes Next's build-time page-data collection, which
// imports every route module regardless of whether it's ever invoked.
function getSessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET env var must be set to a random string of at least 32 characters (see .env.example).',
    );
  }

  return {
    cookieName: 'aegis_session',
    password: secret,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

/**
 * Like getSession(), but re-checks the user's `blocked` status against the
 * database on every call rather than trusting the (otherwise stateless)
 * cookie. A blocked user's session is destroyed the next time they hit a
 * route that calls this — not the instant they're blocked (no push
 * mechanism exists), but before they can do anything else authenticated.
 * Use this for any protected route; use getSession() for the auth mutation
 * routes themselves (login/signup/logout), which don't need the extra
 * lookup.
 */
export async function getActiveSession() {
  const session = await getSession();

  if (session.user) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('users')
      .select('blocked')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!data || data.blocked) {
      session.destroy();
      session.user = undefined;
    }
  }

  return session;
}
