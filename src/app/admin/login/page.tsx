'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/aegis';

type FieldErrors = Record<string, string>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? 'Something went wrong.' });
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrors({ form: 'Network error — please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header
        className="flex h-[52px] items-center gap-5 px-7 text-white"
        style={{ background: 'var(--aegis-navy)' }}
      >
        <div className="flex items-center gap-[9px] text-[15px] font-bold tracking-[-0.01em]">
          <span className="text-[17px]">⚔</span> AEGIS Admin
        </div>
      </header>

      <main className="mx-auto flex max-w-[380px] flex-col justify-center px-6 py-24">
        <div className="rounded-aegis-xl border border-border bg-surface p-[28px]">
          <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Admin sign in</h1>
          <p className="mb-6 text-[13px] text-text-2">
            Admin accounts are provisioned by a master admin — there&apos;s no public sign-up here.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            {errors.form && (
              <div className="text-[12.5px]" style={{ color: '#DC2626' }}>
                {errors.form}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={submitting} className="mt-[4px] w-full">
              {submitting ? 'Please wait…' : 'Log in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
