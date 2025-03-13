'use client';

import * as React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { themes } from '@/lib/themes';

/**
 * Theme provider component for the application.
 * Uses next-themes to manage theme switching between light and dark modes.
 */
export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof NextThemeProvider>) {
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