import { NextResponse } from 'next/server';
import { AdminAuthError, createAdmin, listAdmins } from '@/lib/admin/admins';
import { AdminAccessError, requireMasterAdmin } from '@/lib/admin/guard';
import { validateNewAdmin } from '@/lib/admin/validation';

export async function GET() {
  try {
    await requireMasterAdmin();
    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load admins.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireMasterAdmin();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { email = '', password = '', role = 'admin' } = body;
    const errors = validateNewAdmin({ email, password, role });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    try {
      const admin = await createAdmin({ email, password, role, createdBy: me.id });
      return NextResponse.json({ admin });
    } catch (err) {
      if (err instanceof AdminAuthError) {
        return NextResponse.json({ errors: { email: err.message } }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to create admin.' }, { status: 500 });
  }
}
