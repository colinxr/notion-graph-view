'use client';

import * as React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { themes } from '@/lib/themes';

/**
 * Provider component that wraps the application with theme context
 * Uses next-themes to handle theme switching
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={Object.values(themes)}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
} 