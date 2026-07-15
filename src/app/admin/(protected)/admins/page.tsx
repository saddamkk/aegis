import { getAdminSession } from '@/lib/admin/session';
import { AdminsClient } from './AdminsClient';

export default async function AdminAdminsPage() {
  const session = await getAdminSession();

  if (session.admin?.role !== 'master_admin') {
    return (
      <div className="rounded-aegis-xl border border-border bg-surface p-[28px]">
        <h1 className="mb-1 text-[18px] font-bold">Master admin only</h1>
        <p className="text-[13px] text-text-2">
          Your account doesn&apos;t have permission to manage other admin users.
        </p>
      </div>
    );
  }

  return <AdminsClient />;
}
