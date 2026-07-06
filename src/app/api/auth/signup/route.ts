import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { AuthError, createUser } from '@/lib/auth/users';
import { validateSignup } from '@/lib/auth/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name = '', org = '', email = '', password = '', confirmPassword = '' } = body;
  const errors = validateSignup({ name, org, email, password, confirmPassword });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const user = await createUser({ name, org, email, password });
    const session = await getSession();
    session.user = user;
    await session.save();
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ errors: { email: err.message } }, { status: 409 });
    }
    throw err;
  }
}
