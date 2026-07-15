'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Input } from '@/components/aegis';

type PackageRow = {
  id: string;
  name: string;
  tier: string;
  priceCents: number;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

const emptyForm = { name: '', tier: 'free', priceCents: '0', description: '' };

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}/mo`;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageRow[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (res.ok) {
        setPackages(data.packages);
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
      }
    } catch {
      setLoadFailed(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, the standard "subscribe to an external system" case the rule's own docs call out as valid
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          tier: form.tier,
          priceCents: Number(form.priceCents) || 0,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? 'Something went wrong.' });
        return;
      }
      setForm(emptyForm);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(pkg: PackageRow) {
    await fetch(`/api/admin/packages/${pkg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Subscription packages</h1>
      <p className="mb-6 text-[13px] text-text-2">
        Structure only for now — tier specifics get filled in later.
      </p>

      <div className="mb-8 rounded-aegis-xl border border-border bg-surface p-[22px]">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
          Add package
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[14px]" noValidate>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <Input
            label="Tier"
            placeholder="free, advanced, ..."
            value={form.tier}
            onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
            error={errors.tier}
          />
          <Input
            label="Price (cents)"
            type="number"
            min={0}
            value={form.priceCents}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
            error={errors.priceCents}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          {errors.form && (
            <div className="col-span-2 text-[12.5px]" style={{ color: '#DC2626' }}>
              {errors.form}
            </div>
          )}
          <div className="col-span-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add package'}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-aegis-xl border border-border bg-surface">
        {packages === null && !loadFailed && (
          <div className="p-[22px] text-[13px] text-text-2">Loading…</div>
        )}
        {loadFailed && (
          <div className="p-[22px] text-[13px]" style={{ color: '#D97706' }}>
            Couldn&apos;t load packages — the database may be unreachable.
          </div>
        )}
        {packages?.length === 0 && (
          <div className="p-[22px] text-[13px] text-text-2">No packages yet.</div>
        )}
        {packages?.map((pkg, i) => (
          <div
            key={pkg.id}
            className="flex items-center gap-[14px] px-[22px] py-[16px]"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--aegis-border)' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-[8px]">
                <span className="text-[13px] font-semibold">{pkg.name}</span>
                <Badge tone={pkg.tier === 'free' ? 'neutral' : 'draftReady'}>{pkg.tier}</Badge>
                {!pkg.isActive && <Badge tone="fyi">Inactive</Badge>}
              </div>
              {pkg.description && (
                <div className="mt-[3px] text-[12px] text-text-2">{pkg.description}</div>
              )}
            </div>
            <div className="font-mono text-[12px] text-text-3">{formatPrice(pkg.priceCents)}</div>
            <Button variant="secondary" onClick={() => toggleActive(pkg)}>
              {pkg.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
