import bcrypt from 'bcryptjs';
import { getSql } from '@/lib/db';
import type { SessionUser } from './session';

export class AuthError extends Error {}

// Postgres unique_violation error code.
const UNIQUE_VIOLATION = '23505';

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  org: string;
}): Promise<SessionUser> {
  const sql = getSql();
  const email = input.email.trim().toLowerCase();

  const existing = await sql`select id from users where email = ${email}`;
  if (existing.length > 0) {
    throw new AuthError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const [user] = await sql`
      insert into users (email, password_hash, name, org)
      values (${email}, ${passwordHash}, ${input.name.trim()}, ${input.org.trim()})
      returning id, email, name, org
    `;
    return user as SessionUser;
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === UNIQUE_VIOLATION) {
      throw new AuthError('An account with this email already exists.');
    }
    throw err;
  }
}

export async function verifyUser(email: string, password: string): Promise<SessionUser> {
  const sql = getSql();
  const rows = await sql`
    select id, email, name, org, password_hash
    from users
    where email = ${email.trim().toLowerCase()}
  `;
  const user = rows[0];

  // Compare against a dummy hash when the user doesn't exist, so a missing
  // account and a wrong password take the same amount of time to reject.
  const hash = user?.password_hash ?? '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Ry8xIw5MdQqfmH4hSyF9v9J2RIB2u';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw new AuthError('Invalid email or password.');
  }

  return { id: user.id, email: user.email, name: user.name, org: user.org };
}
