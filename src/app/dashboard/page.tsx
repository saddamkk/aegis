import { redirect } from 'next/navigation';
import { getActiveSession } from '@/lib/auth/session';
import { LogoutButton } from './LogoutButton';

export default async function DashboardPage() {
  const session = await getActiveSession();
  if (!session.user) {
    redirect('/login');
  }

  const { name, org, email } = session.user;

  return (
    <div className="min-h-screen">
      <header
        className="flex h-[52px] items-center gap-5 px-7 text-white"
        style={{ background: 'var(--aegis-navy)' }}
      >
        <div className="flex items-center gap-[9px] text-[15px] font-bold tracking-[-0.01em]">
          <span className="text-[17px]">⚔</span> AEGIS
        </div>
        <div className="flex-1" />
        <LogoutButton />
      </header>

      <main className="mx-auto max-w-[640px] px-10 py-16">
        <div className="rounded-aegis-xl border border-border bg-surface p-[28px]">
          <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Welcome, {name}</h1>
          <p className="text-[13px] text-text-2">
            {org} · {email}
          </p>
        </div>
      </main>
    </div>
  );
}
