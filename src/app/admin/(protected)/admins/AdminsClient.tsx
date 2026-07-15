'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Input } from '@/components/aegis';

type AdminRow = {
  id: string;
  email: string;
  role: 'master_admin' | 'admin';
  createdAt: string;
};

const emptyForm = { email: '', password: '', role: 'admin' as const };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function AdminsClient() {
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState<{ email: string; password: string; role: 'admin' | 'master_admin' }>(
    emptyForm,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins);
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
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  return (
    <div>
      <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Admin users</h1>
      <p className="mb-6 text-[13px] text-text-2">Master admin only.</p>

      <div className="mb-8 rounded-aegis-xl border border-border bg-surface p-[22px]">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">Add admin</div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[14px]" noValidate>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
          />
          <div>
            <label className="mb-[6px] block text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'master_admin' }))}
              className="w-full rounded-aegis-md border border-border px-[12px] py-[10px] text-[13px] text-text-1"
              style={{ background: 'var(--aegis-surface-2)' }}
            >
              <option value="admin">Admin</option>
              <option value="master_admin">Master admin</option>
            </select>
          </div>
          {errors.form && (
            <div className="col-span-2 text-[12.5px]" style={{ color: '#DC2626' }}>
              {errors.form}
            </div>
          )}
          <div className="col-span-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add admin'}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-aegis-xl border border-border bg-surface">
        {admins === null && !loadFailed && (
          <div className="p-[22px] text-[13px] text-text-2">Loading…</div>
        )}
        {loadFailed && (
          <div className="p-[22px] text-[13px]" style={{ color: '#D97706' }}>
            Couldn&apos;t load admins — the database may be unreachable.
          </div>
        )}
        {admins?.map((admin, i) => (
          <div
            key={admin.id}
            className="flex items-center gap-[14px] px-[22px] py-[14px]"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--aegis-border)' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-[8px]">
                <span className="text-[13px] font-semibold">{admin.email}</span>
                <Badge tone={admin.role === 'master_admin' ? 'draftReady' : 'pending'}>
                  {admin.role === 'master_admin' ? 'Master admin' : 'Admin'}
                </Badge>
              </div>
              <div className="mt-[3px] text-[12px] text-text-2">Added {formatDate(admin.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
