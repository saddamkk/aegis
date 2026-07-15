import { DUMMY_HASH, comparePassword, hashPassword } from '@/lib/hash';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { SessionUser } from './session';

export class AuthError extends Error {}

// Postgres unique_violation error code, surfaced through PostgREST.
const UNIQUE_VIOLATION = '23505';

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  org: string;
}): Promise<SessionUser> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) {
    throw new AuthError('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      name: input.name.trim(),
      org: input.org.trim(),
    })
    .select('id, email, name, org')
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new AuthError('An account with this email already exists.');
    }
    throw error;
  }

  return user as SessionUser;
}

export async function verifyUser(email: string, password: string): Promise<SessionUser> {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, org, password_hash, blocked')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  // Compare against a dummy hash when the user doesn't exist, so a missing
  // account and a wrong password take the same amount of time to reject.
  const valid = await comparePassword(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !valid) {
    throw new AuthError('Invalid email or password.');
  }

  // Deliberately a distinct message, not the generic one above -- a
  // suspended user needs to know to contact support, which is worth the
  // (small, already-authenticated-with-correct-password) information
  // disclosure that the account exists.
  if (user.blocked) {
    throw new AuthError('This account has been suspended.');
  }

  return { id: user.id, email: user.email, name: user.name, org: user.org };
}
