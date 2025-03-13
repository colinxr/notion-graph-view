'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { type Theme } from '@/lib/themes';

/**
 * Custom hook for managing theme
 * Provides typed access to the theme state and methods
 */
export function useTheme() {
  const { theme, setTheme, ...rest } = useNextTheme();
  
  const currentTheme = theme as Theme | undefined;
  
  /**
   * Sets the current theme
   * @param newTheme - The new theme to set
   */
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return {
    theme: currentTheme,
    setTheme: changeTheme,
    ...rest,
  };
} 