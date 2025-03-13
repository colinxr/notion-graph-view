'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mainNavItems } from '@/lib/navigation';

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn('md:hidden', className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50"
      >
        <MenuIcon isOpen={isOpen} />
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-0 top-16 z-50 mt-px origin-top animate-in slide-in-from-top-5 bg-background p-6 pt-8 shadow-lg">
            <div className="flex flex-col gap-6">
              <nav className="grid gap-3">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center text-base font-medium',
                      pathname === item.href
                        ? 'text-foreground'
                        : 'text-foreground/60'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
              <div className="grid gap-3">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative h-6 w-6">
      <span
        className={cn(
          'absolute left-0 top-1/2 h-0.5 w-full bg-current transition-all',
          isOpen
            ? 'rotate-45 translate-y-0'
            : '-translate-y-1'
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1/2 h-0.5 w-full bg-current transition-all',
          isOpen && 'opacity-0'
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1/2 h-0.5 w-full bg-current transition-all',
          isOpen
            ? '-rotate-45 translate-y-0'
            : 'translate-y-1'
        )}
      />
    </div>
  );
} 