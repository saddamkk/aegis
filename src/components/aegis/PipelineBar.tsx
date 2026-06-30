import { CheckIcon } from './icons';

export type PipelineStepState = 'done' | 'active' | 'waiting';

export type PipelineStep = {
  label: string;
  state: PipelineStepState;
};

export type PipelineBarProps = {
  steps: PipelineStep[];
  /** Color of the 1px seam between adjacent "done" segments — match the
   *  background the bar sits on so same-tint steps stay visually distinct. */
  dividerColor?: string;
  size?: 'md' | 'sm';
  className?: string;
};

const sizes = {
  md: { padding: '7px 12px', fontSize: '11px', iconSize: 10 },
  sm: { padding: '6px 10px', fontSize: '10px', iconSize: 9 },
};

export function PipelineBar({ steps, dividerColor = 'var(--aegis-surface)', size = 'md', className }: PipelineBarProps) {
  const { padding, fontSize, iconSize } = sizes[size];

  return (
    <div className={`flex ${className ?? ''}`}>
      {steps.map((step, i) => {
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;
        const isDoneAfterDone = step.state === 'done' && i > 0 && steps[i - 1].state === 'done';

        const stateStyle =
          step.state === 'done'
            ? { background: 'var(--aegis-accent-tint)', color: 'var(--aegis-accent)' }
            : step.state === 'active'
              ? { background: 'var(--aegis-accent)', color: '#fff' }
              : { background: 'var(--aegis-surface)', color: 'var(--aegis-text-3)' };

        return (
          <div
            key={step.label}
            className="flex items-center gap-[5px] font-medium"
            style={{
              ...stateStyle,
              padding,
              fontSize,
              fontWeight: step.state === 'active' ? 600 : 500,
              borderRadius: `${isFirst ? '7px' : '0'} ${isLast ? '7px' : '0'} ${isLast ? '7px' : '0'} ${isFirst ? '7px' : '0'}`,
              border: step.state === 'waiting' ? '1px solid var(--aegis-border)' : undefined,
              borderLeft: isDoneAfterDone ? `1px solid ${dividerColor}` : undefined,
            }}
          >
            {step.state === 'done' && <CheckIcon size={iconSize} />}
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
