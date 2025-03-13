'use client';

import { ReactNode } from 'react';
import { Footer } from './footer';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import Link from 'next/link';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">Notion Graph View</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden gap-6 md:flex">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium transition-colors hover:text-foreground/80"
              >
                Dashboard
              </Link>
              <Link 
                href="/help" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Help
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
} 