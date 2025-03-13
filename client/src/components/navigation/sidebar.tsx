'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { dashboardNavItems, NavigationItem } from '@/lib/navigation';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('grid gap-6 px-2', className)}>
      {dashboardNavItems.map((section, i) => (
        <div key={i} className="grid gap-3 pt-4 first:pt-0">
          {section.title && (
            <h4 className="px-2 text-xs font-medium uppercase text-muted-foreground">
              {section.title}
            </h4>
          )}
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

interface SidebarItemProps {
  item: NavigationItem;
  pathname: string;
}

function SidebarItem({ item, pathname }: SidebarItemProps) {
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
        isActive ? 'bg-accent text-accent-foreground' : 'transparent',
      )}
    >
      {item.title}
    </Link>
  );
} 