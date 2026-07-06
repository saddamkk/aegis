import { useId, type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-[6px] block text-[11px] font-bold uppercase tracking-[0.1em] text-text-3"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-aegis-md border px-[12px] py-[10px] text-[13px] text-text-1 outline-none transition-colors duration-[150ms] placeholder:text-text-3 ${
          error ? '' : 'border-border focus:border-accent'
        }`}
        style={error ? { background: 'var(--aegis-surface-2)', borderColor: '#DC2626' } : { background: 'var(--aegis-surface-2)' }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <div id={`${inputId}-error`} className="mt-[6px] text-[11.5px]" style={{ color: '#DC2626' }}>
          {error}
        </div>
      )}
    </div>
  );
}
