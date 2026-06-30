import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const base = 'cursor-pointer rounded-[9px] transition-colors duration-[150ms] ease-out disabled:cursor-not-allowed disabled:opacity-50';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'font-bold text-[13px] text-white bg-accent border-0 px-5 py-[9px] hover:bg-navy-mid',
  secondary:
    'font-medium text-[13px] text-text-2 bg-surface border border-border px-[18px] py-[9px] hover:bg-surface-2',
  danger:
    'font-medium text-[13px] px-[18px] py-[9px] bg-surface border hover:bg-surface-2',
  ghost: 'font-medium text-[13px] text-text-3 bg-transparent border-0 px-3 py-[9px] hover:text-text-2',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'secondary', className, style, ...props }: ButtonProps) {
  const danger = variant === 'danger';
  return (
    <button
      className={`${base} ${variantStyles[variant]} ${className ?? ''}`}
      style={{
        ...(danger ? { color: '#DC2626', borderColor: 'var(--aegis-danger-border)' } : {}),
        ...style,
      }}
      {...props}
    />
  );
}
