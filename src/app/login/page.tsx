'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/aegis';

type Mode = 'login' | 'signup';

type FieldErrors = Record<string, string>;

const emptySignup = { name: '', org: '', email: '', password: '', confirmPassword: '' };
const emptyLogin = { email: '', password: '' };

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [signup, setSignup] = useState(emptySignup);
  const [login, setLogin] = useState(emptyLogin);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? login : signup),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? 'Something went wrong.' });
        return;
      }

      router.push('/dashboard');
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
          <span className="text-[17px]">⚔</span> AEGIS
        </div>
      </header>

      <main className="mx-auto flex max-w-[420px] flex-col justify-center px-6 py-20">
        <div className="mb-6 flex rounded-aegis-pill border border-border bg-surface p-[3px]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="flex-1 rounded-aegis-pill py-[8px] text-[12.5px] font-medium transition-colors duration-[150ms]"
            style={{
              background: mode === 'login' ? 'var(--aegis-accent)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--aegis-text-2)',
            }}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className="flex-1 rounded-aegis-pill py-[8px] text-[12.5px] font-medium transition-colors duration-[150ms]"
            style={{
              background: mode === 'signup' ? 'var(--aegis-accent)' : 'transparent',
              color: mode === 'signup' ? '#fff' : 'var(--aegis-text-2)',
            }}
          >
            Sign up
          </button>
        </div>

        <div className="rounded-aegis-xl border border-border bg-surface p-[28px]">
          <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mb-6 text-[13px] text-text-2">
            {mode === 'login'
              ? 'Log in to your AEGIS workspace.'
              : 'Set up AEGIS for your organization.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]" noValidate>
            {mode === 'signup' && (
              <>
                <Input
                  label="Name"
                  autoComplete="name"
                  value={signup.name}
                  onChange={(e) => setSignup((s) => ({ ...s, name: e.target.value }))}
                  error={errors.name}
                />
                <Input
                  label="Company / organization"
                  autoComplete="organization"
                  value={signup.org}
                  onChange={(e) => setSignup((s) => ({ ...s, org: e.target.value }))}
                  error={errors.org}
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={mode === 'login' ? login.email : signup.email}
              onChange={(e) =>
                mode === 'login'
                  ? setLogin((s) => ({ ...s, email: e.target.value }))
                  : setSignup((s) => ({ ...s, email: e.target.value }))
              }
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={mode === 'login' ? login.password : signup.password}
              onChange={(e) =>
                mode === 'login'
                  ? setLogin((s) => ({ ...s, password: e.target.value }))
                  : setSignup((s) => ({ ...s, password: e.target.value }))
              }
              error={errors.password}
            />

            {mode === 'signup' && (
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={signup.confirmPassword}
                onChange={(e) => setSignup((s) => ({ ...s, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
              />
            )}

            {errors.form && (
              <div className="text-[12.5px]" style={{ color: '#DC2626' }}>
                {errors.form}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={submitting} className="mt-[4px] w-full">
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
