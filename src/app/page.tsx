'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  DraftBlock,
  EmailCard,
  PipelineBar,
  StatCard,
  ThemeToggle,
  TrendCheckIcon,
} from '@/components/aegis';

export default function Home() {
  const [emailOpen, setEmailOpen] = useState(true);
  const [streamKey, setStreamKey] = useState(0);
  const [approved, setApproved] = useState(false);

  function approve() {
    setApproved(true);
    setTimeout(() => setApproved(false), 1600);
  }

  return (
    <div className="min-h-screen">
      <header
        className="flex h-[52px] items-center gap-5 px-7 text-white"
        style={{ background: 'var(--aegis-navy)' }}
      >
        <div className="flex items-center gap-[9px] text-[15px] font-bold tracking-[-0.01em]">
          <span className="text-[17px]">⚔</span> AEGIS
        </div>
        <div className="text-[11px] font-medium tracking-[0.04em] text-white/55">
          COMPONENT LIBRARY · v1.0
        </div>
        <div className="flex-1" />
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-[860px] px-10 py-12">
        <section className="mb-12">
          <h2 className="mb-4 text-[18px] font-bold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-[10px]">
            <Button variant="primary">Approve &amp; send</Button>
            <Button variant="secondary">Edit</Button>
            <Button variant="danger">Reject</Button>
            <Button variant="ghost">Dismiss</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-[18px] font-bold">Classification badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="action">Action</Badge>
            <Badge tone="blocker">Blocker</Badge>
            <Badge tone="decision">Decision</Badge>
            <Badge tone="risk">Risk</Badge>
            <Badge tone="fyi">FYI</Badge>
            <Badge tone="approved">Approved</Badge>
            <Badge tone="pending">Pending</Badge>
            <Badge tone="draftReady">Draft ready</Badge>
            <Badge tone="sent">Sent</Badge>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-[18px] font-bold">Stat cards</h2>
          <div className="grid grid-cols-4 gap-[10px]">
            <StatCard
              icon={<TrendCheckIcon />}
              iconBg="var(--aegis-accent-tint)"
              iconColor="var(--aegis-accent)"
              value={7}
              valueColor="var(--aegis-accent)"
              label="Awaiting approval"
              delta="+3"
              deltaBg="#ECFDF5"
              deltaColor="#059669"
            />
            <StatCard
              icon="D"
              iconBg="var(--aegis-accent-tint)"
              iconColor="var(--aegis-accent)"
              value={12}
              label="Drafts ready"
              delta="+5"
              deltaBg="#ECFDF5"
              deltaColor="#059669"
            />
            <StatCard
              icon="✓"
              iconBg="#ECFDF5"
              iconColor="#059669"
              value={48}
              valueColor="#059669"
              label="Sent today"
              delta="+12%"
              deltaBg="#ECFDF5"
              deltaColor="#059669"
            />
            <StatCard
              icon="!"
              iconBg="#FFFBEB"
              iconColor="#D97706"
              value={3}
              valueColor="#D97706"
              label="Flagged risks"
              delta="−1"
              deltaBg="var(--aegis-fyi-bg)"
              deltaColor="var(--aegis-text-3)"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-[18px] font-bold">Pipeline bar</h2>
          <PipelineBar
            steps={[
              { label: 'Classified', state: 'done' },
              { label: 'Grounded', state: 'done' },
              { label: 'Awaiting approval', state: 'active' },
              { label: 'Sent', state: 'waiting' },
            ]}
          />
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-[18px] font-bold">Draft block — grounded reply</h2>
          <DraftBlock
            streamKey={streamKey}
            pulse={approved}
            text="Confirming the rollback is approved. The vendor SLA permits a 4-hour remediation window, and our last clean snapshot is from 02:14 PKT. I've looped in the on-call lead."
            sourceLabel="SLA policy doc"
            warningLabel="Snapshot time unverified"
          />
          <div className="mt-3">
            <Button variant="ghost" onClick={() => setStreamKey((k) => k + 1)}>
              ↺ Replay draft stream
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-[18px] font-bold">Email card</h2>
          <EmailCard
            classification="action"
            classificationLabel="Action"
            status="draftReady"
            statusLabel="Draft ready"
            initials="MW"
            name="Marcus Webb"
            subject="Production incident — needs your approval to roll back"
            time="09:18"
            open={emailOpen}
            onToggle={() => setEmailOpen((o) => !o)}
          >
            <div className="my-[14px]">
              <PipelineBar
                size="sm"
                dividerColor="var(--aegis-canvas)"
                steps={[
                  { label: 'Classified', state: 'done' },
                  { label: 'Grounded', state: 'done' },
                  { label: 'Awaiting approval', state: 'active' },
                  { label: 'Sent', state: 'waiting' },
                ]}
              />
            </div>
            <DraftBlock
              streamKey={streamKey}
              pulse={approved}
              text="Confirming the rollback is approved. The vendor SLA permits a 4-hour remediation window, and our last clean snapshot is from 02:14 PKT. I've looped in the on-call lead."
              sourceLabel="SLA policy doc"
              warningLabel="Snapshot time unverified"
            />
            <div className="mt-[14px] flex items-center gap-2">
              <Button variant="ghost" className="mr-auto" onClick={() => setStreamKey((k) => k + 1)}>
                ↺ Replay draft stream
              </Button>
              <Button variant="secondary">Edit</Button>
              <Button variant="danger">Reject</Button>
              <Button variant="primary" onClick={approve}>
                {approved ? 'Sent ✓' : 'Approve & send'}
              </Button>
            </div>
          </EmailCard>
        </section>
      </main>
    </div>
  );
}
