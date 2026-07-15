import { getSupabaseAdmin } from '@/lib/supabase';

// Deliberately excludes email and name -- the admin panel is not supposed
// to expose personal data, only enough to manage accounts.
export type PlatformUserListItem = {
  id: string;
  createdAt: string;
  org: string;
  blocked: boolean;
  package: { name: string; tier: string } | null;
};

export async function listPlatformUsers(): Promise<PlatformUserListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('id, created_at, org, blocked, subscription_packages(name, tier)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const pkg = Array.isArray(row.subscription_packages) ? row.subscription_packages[0] : row.subscription_packages;
    return {
      id: row.id,
      createdAt: row.created_at,
      org: row.org,
      blocked: row.blocked,
      package: pkg ? { name: pkg.name, tier: pkg.tier } : null,
    };
  });
}

export async function setUserBlocked(id: string, blocked: boolean): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('users').update({ blocked }).eq('id', id);
  if (error) throw error;
}
