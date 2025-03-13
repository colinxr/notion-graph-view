'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
  homeLabel?: string;
  separator?: string;
}

export function Breadcrumbs({
  className,
  homeLabel = 'Home',
  separator = '/',
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Define segments and their URLs
  const breadcrumbs = segments.map((segment, index) => {
    const url = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: url,
    };
  });

  return (
    <nav
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground',
        className
      )}
      aria-label="Breadcrumbs"
    >
      <Link
        href="/"
        className="hover:text-foreground transition-colors"
      >
        {homeLabel}
      </Link>
      {breadcrumbs.length > 0 &&
        breadcrumbs.map((breadcrumb, index) => (
          <div
            key={breadcrumb.href}
            className="flex items-center gap-1.5"
          >
            <span
              className="text-muted-foreground"
              aria-hidden="true"
            >
              {separator}
            </span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </div>
        ))}
    </nav>
  );
} 