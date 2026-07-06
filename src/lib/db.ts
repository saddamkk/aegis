import postgres from 'postgres';

// Reused across invocations within the same serverless runtime instance
// (and across hot-reloads in dev) instead of opening a new connection per
// request.
declare global {
  var __aegisSql: ReturnType<typeof postgres> | undefined;
}

export function getSql() {
  if (!globalThis.__aegisSql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL env var must be set (see .env.example).');
    }
    globalThis.__aegisSql = postgres(url, { ssl: 'require' });
  }
  return globalThis.__aegisSql;
}
