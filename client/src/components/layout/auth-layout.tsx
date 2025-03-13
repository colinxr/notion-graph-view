'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  showThemeToggle?: boolean;
  className?: string;
}

export function AuthLayout({
  children,
  showThemeToggle = true,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Notion Graph View</span>
          </Link>
          {showThemeToggle && <ThemeToggle />}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className={cn("mx-auto w-full max-w-md", className)}>
          {children}
        </div>
      </main>
      <footer className="border-t py-3">
        <div className="container flex justify-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Notion Graph View
        </div>
      </footer>
    </div>
  );
} 