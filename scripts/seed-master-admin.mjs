// One-time bootstrap for the first master admin. Idempotent -- safe to run
// again; it does nothing if a master_admin already exists. Run with:
//   npm run seed:admin
// (which passes --env-file=.env.local so these vars are picked up).

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD } = process.env;

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

requireEnv('SUPABASE_URL', SUPABASE_URL);
requireEnv('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY);
requireEnv('MASTER_ADMIN_EMAIL', MASTER_ADMIN_EMAIL);
requireEnv('MASTER_ADMIN_PASSWORD', MASTER_ADMIN_PASSWORD);

if (MASTER_ADMIN_PASSWORD.length < 8) {
  console.error('MASTER_ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data: existing, error: checkError } = await supabase
  .from('admins')
  .select('id')
  .eq('role', 'master_admin')
  .limit(1);

if (checkError) {
  console.error('Failed to check for an existing master admin:', checkError.message);
  process.exit(1);
}

if (existing.length > 0) {
  console.log('A master admin already exists — skipping (this script is idempotent).');
  process.exit(0);
}

const email = MASTER_ADMIN_EMAIL.trim().toLowerCase();
const passwordHash = await bcrypt.hash(MASTER_ADMIN_PASSWORD, 10);

const { error: insertError } = await supabase
  .from('admins')
  .insert({ email, password_hash: passwordHash, role: 'master_admin' });

if (insertError) {
  console.error('Failed to create the master admin:', insertError.message);
  process.exit(1);
}

console.log(`Master admin created: ${email}`);
