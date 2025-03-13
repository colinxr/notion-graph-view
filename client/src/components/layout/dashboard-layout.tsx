'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { MainLayout } from './main-layout';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <MainLayout>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <nav className="grid items-start gap-2 py-4">
            <Link 
              href="/dashboard" 
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                "bg-accent text-accent-foreground"
              )}
            >
              Overview
            </Link>
            <Link 
              href="/dashboard/databases" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Databases
            </Link>
            <Link 
              href="/dashboard/graphs" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Graphs
            </Link>
            <Link 
              href="/dashboard/embeds" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Embeds
            </Link>
            <Link 
              href="/dashboard/subscription" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Subscription
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Settings
            </Link>
          </nav>
        </aside>
        <main className={cn("flex flex-col gap-4 py-4", className)}>
          {children}
        </main>
      </div>
    </MainLayout>
  );
} 