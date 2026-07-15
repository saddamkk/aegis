import { getAdminSession, type SessionAdmin } from './session';

export class AdminAccessError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin(): Promise<SessionAdmin> {
  const session = await getAdminSession();
  if (!session.admin) throw new AdminAccessError('Not authenticated.', 401);
  return session.admin;
}

export async function requireMasterAdmin(): Promise<SessionAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== 'master_admin') throw new AdminAccessError('Master admin only.', 403);
  return admin;
}
