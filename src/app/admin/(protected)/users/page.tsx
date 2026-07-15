'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/aegis';

type UserRow = {
  id: string;
  createdAt: string;
  org: string;
  blocked: boolean;
  package: { name: string; tier: string } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
      }
    } catch {
      setLoadFailed(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, the standard "subscribe to an external system" case the rule's own docs call out as valid
    load();
  }, []);

  async function toggleBlocked(user: UserRow) {
    setPendingId(user.id);
    try {
      await fetch(`/api/admin/users/${user.id}/${user.blocked ? 'unblock' : 'block'}`, { method: 'POST' });
      await load();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Platform users</h1>
      <p className="mb-6 text-[13px] text-text-2">
        No emails or names shown here by design — this is account management, not a contact list.
      </p>

      <div className="rounded-aegis-xl border border-border bg-surface">
        {users === null && !loadFailed && (
          <div className="p-[22px] text-[13px] text-text-2">Loading…</div>
        )}
        {loadFailed && (
          <div className="p-[22px] text-[13px]" style={{ color: '#D97706' }}>
            Couldn&apos;t load users — the database may be unreachable.
          </div>
        )}
        {users?.length === 0 && <div className="p-[22px] text-[13px] text-text-2">No users yet.</div>}
        {users?.map((user, i) => (
          <div
            key={user.id}
            className="flex items-center gap-[14px] px-[22px] py-[14px]"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--aegis-border)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[8px]">
                <span className="truncate font-mono text-[11px] text-text-3">{user.id}</span>
                {user.blocked ? (
                  <Badge tone="action">Blocked</Badge>
                ) : (
                  <Badge tone="approved">Active</Badge>
                )}
                <Badge tone={user.package?.tier === 'free' ? 'neutral' : 'draftReady'}>
                  {user.package?.name ?? 'No package'}
                </Badge>
              </div>
              <div className="mt-[3px] text-[12px] text-text-2">
                {user.org} · signed up {formatDate(user.createdAt)}
              </div>
            </div>
            <Button
              variant={user.blocked ? 'secondary' : 'danger'}
              disabled={pendingId === user.id}
              onClick={() => toggleBlocked(user)}
            >
              {pendingId === user.id ? 'Working…' : user.blocked ? 'Unblock' : 'Block'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
