import { DUMMY_HASH, comparePassword, hashPassword } from '@/lib/hash';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { AdminRole, SessionAdmin } from './session';

export class AdminAuthError extends Error {}

const UNIQUE_VIOLATION = '23505';

export async function verifyAdmin(email: string, password: string): Promise<SessionAdmin> {
  const supabase = getSupabaseAdmin();
  const { data: admin } = await supabase
    .from('admins')
    .select('id, email, role, password_hash')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  const valid = await comparePassword(password, admin?.password_hash ?? DUMMY_HASH);

  if (!admin || !valid) {
    throw new AdminAuthError('Invalid email or password.');
  }

  return { id: admin.id, email: admin.email, role: admin.role };
}

/** Master-admin only -- enforced by the caller (route handler) checking
 *  the current session's role before calling this. */
export async function createAdmin(input: {
  email: string;
  password: string;
  role: AdminRole;
  createdBy: string;
}): Promise<SessionAdmin> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await supabase.from('admins').select('id').eq('email', email).maybeSingle();
  if (existing) {
    throw new AdminAuthError('An admin with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);

  const { data: admin, error } = await supabase
    .from('admins')
    .insert({ email, password_hash: passwordHash, role: input.role, created_by: input.createdBy })
    .select('id, email, role')
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new AdminAuthError('An admin with this email already exists.');
    }
    throw error;
  }

  return admin as SessionAdmin;
}

export type AdminListItem = SessionAdmin & { createdAt: string };

export async function listAdmins(): Promise<AdminListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((a) => ({ id: a.id, email: a.email, role: a.role, createdAt: a.created_at }));
}
