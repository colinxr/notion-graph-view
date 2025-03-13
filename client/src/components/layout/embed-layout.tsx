'use client';

import { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

interface EmbedLayoutProps {
  children: ReactNode;
  graphId: string;
  showControls?: boolean;
  className?: string;
}

export function EmbedLayout({
  children,
  graphId,
  showControls = true,
  className,
}: EmbedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showControls && (
        <header className="border-b bg-background p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Graph ID: {graphId}
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}
      <main className={cn("flex-1 overflow-hidden", className)}>
        {children}
      </main>
      {showControls && (
        <footer className="border-t p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Powered by Notion Graph View
            </span>
          </div>
        </footer>
      )}
    </div>
  );
} 