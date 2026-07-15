import { NextResponse } from 'next/server';
import { AdminAuthError, verifyAdmin } from '@/lib/admin/admins';
import { getAdminSession } from '@/lib/admin/session';
import { validateAdminLogin } from '@/lib/admin/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { email = '', password = '' } = body;
  const errors = validateAdminLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const admin = await verifyAdmin(email, password);
    const session = await getAdminSession();
    session.admin = admin;
    await session.save();
    return NextResponse.json({ admin });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ errors: { password: err.message } }, { status: 401 });
    }
    throw err;
  }
}
