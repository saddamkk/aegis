import { getAdminSession } from '@/lib/admin/session';
import { listPackages } from '@/lib/admin/packages';
import { listPlatformUsers } from '@/lib/admin/platformUsers';
import { StatCard, TrendCheckIcon } from '@/components/aegis';

export default async function AdminOverviewPage() {
  const session = await getAdminSession();

  let packagesCount: number | null = null;
  let usersCount: number | null = null;
  let blockedCount: number | null = null;
  let loadError = false;

  try {
    const [packages, users] = await Promise.all([listPackages(), listPlatformUsers()]);
    packagesCount = packages.length;
    usersCount = users.length;
    blockedCount = users.filter((u) => u.blocked).length;
  } catch {
    // Don't let a database hiccup take down the whole admin shell (nav,
    // logout, etc.) -- show the page with placeholders instead.
    loadError = true;
  }

  return (
    <div>
      <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Overview</h1>
      <p className="mb-6 text-[13px] text-text-2">Signed in as {session.admin?.email}.</p>

      {loadError && (
        <div
          className="mb-4 rounded-aegis-md px-[14px] py-[10px] text-[12.5px]"
          style={{ background: '#FFFBEB', color: '#D97706' }}
        >
          Couldn&apos;t reach the database — counts unavailable right now.
        </div>
      )}

      <div className="grid grid-cols-3 gap-[10px]">
        <StatCard
          icon={<TrendCheckIcon />}
          iconBg="var(--aegis-accent-tint)"
          iconColor="var(--aegis-accent)"
          value={usersCount ?? '—'}
          valueColor="var(--aegis-accent)"
          label="Platform users"
        />
        <StatCard
          icon="!"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          value={blockedCount ?? '—'}
          valueColor="#DC2626"
          label="Blocked users"
        />
        <StatCard
          icon="P"
          iconBg="var(--aegis-accent-tint)"
          iconColor="var(--aegis-accent)"
          value={packagesCount ?? '—'}
          label="Subscription packages"
        />
      </div>
    </div>
  );
}
