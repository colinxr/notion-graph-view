'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue={pathname.includes('/profile') ? 'profile' : 'account'} className="w-full">
        <TabsList className="mb-6">
          <Link href="/dashboard/settings/profile" passHref>
            <TabsTrigger
              value="profile"
              className={cn(
                pathname.includes('/profile') ? 'bg-muted' : ''
              )}
            >
              Profile
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/settings/account" passHref>
            <TabsTrigger
              value="account"
              className={cn(
                pathname.includes('/account') ? 'bg-muted' : ''
              )}
            >
              Account
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  );
} 