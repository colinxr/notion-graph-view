export type Theme = 'light' | 'dark' | 'system';

export const themes: Record<Exclude<Theme, 'system'>, string> = {
  light: 'light',
  dark: 'dark',
};

export const DEFAULT_THEME: Theme = 'system'; 