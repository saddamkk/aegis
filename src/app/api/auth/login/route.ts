import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { AuthError, verifyUser } from '@/lib/auth/users';
import { validateLogin } from '@/lib/auth/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { email = '', password = '' } = body;
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const user = await verifyUser(email, password);
    const session = await getSession();
    session.user = user;
    await session.save();
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ errors: { password: err.message } }, { status: 401 });
    }
    throw err;
  }
}
