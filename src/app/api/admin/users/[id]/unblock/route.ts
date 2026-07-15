import { NextResponse } from 'next/server';
import { AdminAccessError, requireAdmin } from '@/lib/admin/guard';
import { setUserBlocked } from '@/lib/admin/platformUsers';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await setUserBlocked(id, false);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to unblock user.' }, { status: 500 });
  }
}
