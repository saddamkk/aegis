'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/packages', label: 'Packages' },
  { href: '/admin/users', label: 'Users' },
];

export function AdminNav({ showAdmins }: { showAdmins: boolean }) {
  const pathname = usePathname();
  const items = showAdmins ? [...links, { href: '/admin/admins', label: 'Admins' }] : links;

  return (
    <nav className="flex gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-aegis-md px-3 py-[6px] text-[13px] font-medium transition-colors duration-[150ms]"
            style={{
              color: '#fff',
              background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
