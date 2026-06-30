import type { ReactNode } from 'react';

export type StatCardProps = {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  valueColor?: string;
  label: string;
  delta?: string;
  deltaBg?: string;
  deltaColor?: string;
  className?: string;
};

export function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  valueColor,
  label,
  delta,
  deltaBg,
  deltaColor,
  className,
}: StatCardProps) {
  return (
    <div
      className={`rounded-aegis-lg border border-border bg-surface px-[14px] py-[12px] ${className ?? ''}`}
    >
      <div className="mb-[10px] flex items-center justify-between">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-aegis-sm"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {delta && (
          <span
            className="rounded-aegis-pill px-[7px] py-[3px] text-[10px] font-semibold"
            style={{ background: deltaBg, color: deltaColor }}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="text-xl font-bold" style={{ color: valueColor ?? 'var(--aegis-text-1)' }}>
        {value}
      </div>
      <div className="mt-[2px] text-[10px] font-medium uppercase tracking-[0.06em] text-text-3">
        {label}
      </div>
    </div>
  );
}
