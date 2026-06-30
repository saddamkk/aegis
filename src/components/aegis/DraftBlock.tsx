import { AlertTriangleIcon, DatabaseIcon } from './icons';

export type DraftBlockProps = {
  text: string;
  sourceLabel: string;
  warningLabel?: string;
  /** Change this value (e.g. on "replay") to remount the block and replay
   *  the 500ms stream-in — the signature motion. */
  streamKey?: string | number;
  /** Navy/accent pulse ring — the approval ceremony's emotional beat. */
  pulse?: boolean;
  className?: string;
};

export function DraftBlock({ text, sourceLabel, warningLabel, streamKey, pulse, className }: DraftBlockProps) {
  return (
    <div
      key={streamKey}
      className={`border border-l-[3px] px-[17px] py-[15px] ${className ?? ''}`}
      style={{
        background: 'var(--aegis-surface)',
        borderColor: 'rgba(20,34,89,0.13)',
        borderLeftColor: 'var(--aegis-accent)',
        borderRadius: '0 9px 9px 0',
        animation: pulse ? 'aegisPulse 300ms ease-out' : 'aegisStream 500ms ease-out',
      }}
    >
      <div className="text-[13px] leading-[1.8]" style={{ color: 'var(--aegis-text-1)' }}>
        {text}
      </div>
      <div className="mt-[14px] flex flex-wrap gap-[8px] border-t border-border pt-[12px]">
        <span
          className="inline-flex items-center gap-[5px] rounded-[5px] px-[8px] py-[4px] text-[10px] font-semibold"
          style={{ background: 'var(--aegis-accent-tint)', color: 'var(--aegis-accent)' }}
        >
          <DatabaseIcon />
          {sourceLabel}
        </span>
        {warningLabel && (
          <span
            className="inline-flex items-center gap-[5px] rounded-[5px] px-[8px] py-[4px] text-[10px] font-semibold"
            style={{ background: '#FFFBEB', color: '#D97706' }}
          >
            <AlertTriangleIcon />
            {warningLabel}
          </span>
        )}
      </div>
    </div>
  );
}
