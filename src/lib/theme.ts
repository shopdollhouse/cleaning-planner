// Dark mode has been removed — the app is locked to light mode only.
// These helpers are kept as no-op stubs so any older imports keep working.

export type Theme = 'light';

export function getEffectiveTheme(_theme?: Theme): 'light' {
  return 'light';
}

export function applyTheme(_theme?: Theme) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
}

export function setupThemeListener(_onThemeChange: (theme: 'light') => void) {
  return () => {};
}
