import { getSupabaseAdmin } from '@/lib/supabase';

export type SubscriptionPackage = {
  id: string;
  name: string;
  tier: string;
  priceCents: number;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

function toPackage(row: {
  id: string;
  name: string;
  tier: string;
  price_cents: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}): SubscriptionPackage {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    priceCents: row.price_cents,
    description: row.description,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function listPackages(): Promise<SubscriptionPackage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscription_packages')
    .select('id, name, tier, price_cents, description, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toPackage);
}

export async function createPackage(input: {
  name: string;
  tier: string;
  priceCents: number;
  description?: string;
  sortOrder?: number;
}): Promise<SubscriptionPackage> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscription_packages')
    .insert({
      name: input.name.trim(),
      tier: input.tier.trim(),
      price_cents: input.priceCents,
      description: input.description?.trim() || null,
      sort_order: input.sortOrder ?? 0,
    })
    .select('id, name, tier, price_cents, description, is_active, sort_order, created_at')
    .single();

  if (error) throw error;
  return toPackage(data);
}

export async function setPackageActive(id: string, isActive: boolean): Promise<SubscriptionPackage> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscription_packages')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, tier, price_cents, description, is_active, sort_order, created_at')
    .single();

  if (error) throw error;
  return toPackage(data);
}
