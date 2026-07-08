import bcrypt from 'bcryptjs';
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

  const passwordHash = await bcrypt.hash(input.password, 10);

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
    .select('id, email, name, org, password_hash')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  // Compare against a dummy hash when the user doesn't exist, so a missing
  // account and a wrong password take the same amount of time to reject.
  const hash = user?.password_hash ?? '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Ry8xIw5MdQqfmH4hSyF9v9J2RIB2u';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw new AuthError('Invalid email or password.');
  }

  return { id: user.id, email: user.email, name: user.name, org: user.org };
}
