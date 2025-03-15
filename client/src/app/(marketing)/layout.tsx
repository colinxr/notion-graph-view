'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Footer } from '@/components/layout/footer';

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
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
                href="/features" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link 
                href="/docs" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Documentation
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium transition-colors hover:text-foreground/80"
              >
                Dashboard
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