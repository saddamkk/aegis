import { NextResponse } from 'next/server';
import { AdminAccessError, requireAdmin } from '@/lib/admin/guard';
import { setPackageActive } from '@/lib/admin/packages';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const pkg = await setPackageActive(id, body.isActive);
    return NextResponse.json({ package: pkg });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to update package.' }, { status: 500 });
  }
}
