'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/aegis';

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={logout}>
      Log out
    </Button>
  );
}
