import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/session';
import { AdminLogoutButton } from './AdminLogoutButton';
import { AdminNav } from './AdminNav';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session.admin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen">
      <header
        className="flex h-[52px] items-center gap-6 px-7 text-white"
        style={{ background: 'var(--aegis-navy)' }}
      >
        <div className="flex items-center gap-[9px] text-[15px] font-bold tracking-[-0.01em]">
          <span className="text-[17px]">⚔</span> AEGIS Admin
        </div>
        <AdminNav showAdmins={session.admin.role === 'master_admin'} />
        <div className="flex-1" />
        <span className="text-[11px] font-medium text-white/55">{session.admin.email}</span>
        <AdminLogoutButton />
      </header>

      <main className="mx-auto max-w-[900px] px-10 py-12">{children}</main>
    </div>
  );
}
