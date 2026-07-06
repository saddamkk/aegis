import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { SessionUser } from './session';

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  org: string;
  createdAt: string;
};

// File-backed store — real hashing and persistence, no external DB service
// required for this scope. Not safe for concurrent-write-heavy production
// traffic (no file locking); swap for a real database before that matters.
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

function readAll(): StoredUser[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(users: StoredUser[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

export class AuthError extends Error {}

function toSessionUser(user: StoredUser): SessionUser {
  return { id: user.id, email: user.email, name: user.name, org: user.org };
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  org: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const users = readAll();

  if (users.some((u) => u.email === email)) {
    throw new AuthError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    name: input.name.trim(),
    org: input.org.trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);

  return toSessionUser(user);
}

export async function verifyUser(email: string, password: string): Promise<SessionUser> {
  const users = readAll();
  const user = users.find((u) => u.email === email.trim().toLowerCase());

  // Compare against a dummy hash when the user doesn't exist, so a missing
  // account and a wrong password take the same amount of time to reject.
  const hash = user?.passwordHash ?? '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Ry8xIw5MdQqfmH4hSyF9v9J2RIB2u';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw new AuthError('Invalid email or password.');
  }

  return toSessionUser(user);
}
