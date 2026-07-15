import bcrypt from 'bcryptjs';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// A valid bcrypt hash of an arbitrary password, used to compare against
// when no real user/admin row exists — keeps the "not found" and "wrong
// password" paths taking a similar amount of time, so failed lookups
// don't leak which case occurred via response timing.
export const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Ry8xIw5MdQqfmH4hSyF9v9J2RIB2u';
