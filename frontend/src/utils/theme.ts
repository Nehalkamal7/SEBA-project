export type Theme = 'light' | 'dark';

const THEME_KEY = 'seba-theme';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored) return stored;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(THEME_KEY, theme);
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  setTheme(getTheme());
}

