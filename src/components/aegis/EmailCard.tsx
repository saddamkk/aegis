import type { ReactNode } from 'react';
import type { ClassificationTone } from '@/lib/aegis/tokens';
import { Badge, type BadgeTone } from './Badge';
import { ChevronIcon } from './icons';

const toneColorVar: Record<ClassificationTone, string> = {
  action: 'var(--aegis-action-color)',
  blocker: 'var(--aegis-blocker-color)',
  decision: 'var(--aegis-decision-color)',
  risk: 'var(--aegis-risk-color)',
  fyi: 'var(--aegis-fyi-color)',
  approved: 'var(--aegis-approved-color)',
  pending: 'var(--aegis-pending-color)',
  neutral: 'var(--aegis-neutral-color)',
};

const toneBgVar: Record<ClassificationTone, string> = {
  action: 'var(--aegis-action-bg)',
  blocker: 'var(--aegis-blocker-bg)',
  decision: 'var(--aegis-decision-bg)',
  risk: 'var(--aegis-risk-bg)',
  fyi: 'var(--aegis-fyi-bg)',
  approved: 'var(--aegis-approved-bg)',
  pending: 'var(--aegis-pending-bg)',
  neutral: 'var(--aegis-neutral-bg)',
};

export type EmailCardProps = {
  classification: ClassificationTone;
  classificationLabel: string;
  status: BadgeTone;
  statusLabel: string;
  initials: string;
  name: string;
  subject: string;
  time: string;
  open?: boolean;
  onToggle?: () => void;
  /** Expanded detail area — pipeline, draft block, approval bar, etc. */
  children?: ReactNode;
  className?: string;
};

export function EmailCard({
  classification,
  classificationLabel,
  status,
  statusLabel,
  initials,
  name,
  subject,
  time,
  open = false,
  onToggle,
  children,
  className,
}: EmailCardProps) {
  const color = toneColorVar[classification];
  const bg = toneBgVar[classification];

  return (
    <div
      className={`overflow-hidden rounded-aegis-lg border border-border bg-surface transition-colors duration-[150ms] ${className ?? ''}`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle?.()}
        className="flex cursor-pointer items-center gap-[12px] px-[16px] py-[13px]"
      >
        <span className="h-[10px] w-[10px] flex-none rounded-full" style={{ background: color }} />
        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ background: bg, color }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[8px]">
            <span className="text-[12px] font-bold text-text-1">{name}</span>
            <Badge tone={classification}>{classificationLabel}</Badge>
            <Badge tone={status}>{statusLabel}</Badge>
          </div>
          <div className="mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-text-2">
            {subject}
          </div>
        </div>
        <span className="flex-none font-mono text-[10px] text-text-3">{time}</span>
        <ChevronIcon
          className="flex-none transition-transform duration-[200ms]"
          size={14}
          style={{
            color: open ? 'var(--aegis-accent)' : 'var(--aegis-text-3)',
            transform: open ? 'rotate(90deg)' : 'none',
          }}
        />
      </div>

      {open && children && (
        <div
          className="border-t border-border px-[16px] pb-[16px] pt-[4px]"
          style={{ background: 'var(--aegis-canvas)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
