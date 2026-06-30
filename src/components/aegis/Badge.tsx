import type { ReactNode } from 'react';
import type { ClassificationTone } from '@/lib/aegis/tokens';
import {
  AlertTriangleIcon,
  BarrierIcon,
  BoltIcon,
  CheckIcon,
  GitBranchIcon,
  SparkleIcon,
} from './icons';

export type BadgeTone = ClassificationTone | 'draftReady' | 'sent';

const icons: Partial<Record<BadgeTone, ReactNode>> = {
  action: <BoltIcon />,
  blocker: <BarrierIcon />,
  decision: <GitBranchIcon />,
  risk: <AlertTriangleIcon />,
  approved: <CheckIcon />,
  draftReady: <SparkleIcon />,
};

// The FYI tone is the one classification color treated as a muted, bordered
// chip rather than a tinted one — matches the spec's "FYI ... border" rule.
const borderedTones = new Set<BadgeTone>(['fyi']);

const toneVars: Record<BadgeTone, { color: string; bg: string }> = {
  action: { color: 'var(--aegis-action-color)', bg: 'var(--aegis-action-bg)' },
  blocker: { color: 'var(--aegis-blocker-color)', bg: 'var(--aegis-blocker-bg)' },
  decision: { color: 'var(--aegis-decision-color)', bg: 'var(--aegis-decision-bg)' },
  risk: { color: 'var(--aegis-risk-color)', bg: 'var(--aegis-risk-bg)' },
  fyi: { color: 'var(--aegis-fyi-color)', bg: 'var(--aegis-fyi-bg)' },
  approved: { color: 'var(--aegis-approved-color)', bg: 'var(--aegis-approved-bg)' },
  pending: { color: 'var(--aegis-pending-color)', bg: 'var(--aegis-pending-bg)' },
  neutral: { color: 'var(--aegis-neutral-color)', bg: 'var(--aegis-neutral-bg)' },
  draftReady: { color: 'var(--aegis-accent)', bg: 'var(--aegis-accent-tint)' },
  sent: { color: 'var(--aegis-text-3)', bg: 'var(--aegis-sent-bg)' },
};

export type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone, children, className }: BadgeProps) {
  const { color, bg } = toneVars[tone];
  const icon = icons[tone];
  const bordered = borderedTones.has(tone);

  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-aegis-pill px-[10px] py-[5px] text-[11px] font-medium ${className ?? ''}`}
      style={{
        color,
        background: bg,
        border: bordered ? '1px solid var(--aegis-border)' : undefined,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
