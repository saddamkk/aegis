'use client';

import { useTheme } from '@/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-[2px] rounded-aegis-pill bg-white/10 p-[3px]">
      <button
        onClick={toggleTheme}
        className="rounded-aegis-pill px-3 py-[6px] text-[11px] font-medium text-white transition-colors duration-[150ms]"
        style={{ background: theme === 'light' ? 'rgba(255,255,255,0.18)' : 'transparent' }}
      >
        Light
      </button>
      <button
        onClick={toggleTheme}
        className="rounded-aegis-pill px-3 py-[6px] text-[11px] font-medium text-white transition-colors duration-[150ms]"
        style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'transparent' }}
      >
        Dark
      </button>
    </div>
  );
}
