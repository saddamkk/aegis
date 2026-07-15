import { NextResponse } from 'next/server';
import { AdminAccessError, requireAdmin } from '@/lib/admin/guard';
import { createPackage, listPackages } from '@/lib/admin/packages';
import { validatePackage } from '@/lib/admin/validation';

export async function GET() {
  try {
    await requireAdmin();
    const packages = await listPackages();
    return NextResponse.json({ packages });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load packages.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { name = '', tier = '', priceCents = 0, description = '' } = body;
    const errors = validatePackage({ name, tier, priceCents, description });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const pkg = await createPackage({ name, tier, priceCents, description });
    return NextResponse.json({ package: pkg });
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to create package.' }, { status: 500 });
  }
}
