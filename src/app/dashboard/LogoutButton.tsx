'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/aegis';

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={logout}>
      Log out
    </Button>
  );
}
