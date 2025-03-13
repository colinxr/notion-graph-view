import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t py-6 md:py-8', className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Notion Graph View. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/terms" 
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          <Link 
            href="/privacy" 
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
} 