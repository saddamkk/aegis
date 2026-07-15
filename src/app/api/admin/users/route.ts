import { NextResponse } from 'next/server';
import { AdminAccessError, requireAdmin } from '@/lib/admin/guard';
import { listPlatformUsers } from '@/lib/admin/platformUsers';

export async function GET() {
  try {
    await requireAdmin();
    const users = await listPlatformUsers();
    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load users.' }, { status: 500 });
  }
}
